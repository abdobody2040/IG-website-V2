import React, { createContext, useContext, useState, useEffect } from 'react'
import { pb } from '../lib/pocketbase'
import { useAuth } from './useAuth'
import type { RecordModel } from 'pocketbase'

export interface Workspace {
  id: string
  name: string
  owner: string
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: 'admin' | 'member' | 'viewer'
}

interface WorkspaceContextProps {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  isLoading: boolean
  switchWorkspace: (id: string) => void
  createWorkspace: (name: string) => Promise<Workspace>
  refreshWorkspaces: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchWorkspaces = async (userId: string) => {
    try {
      // 1. Fetch from workspace_members junction table
      const members = await pb.collection('workspace_members').getFullList({
        filter: `user = "${userId}"`,
        expand: 'workspace',
      })

      let list = members
        .map(m => {
          const ws = m.expand?.workspace as RecordModel | undefined
          if (!ws) return null
          return {
            id: ws.id,
            name: ws.name as string,
            owner: ws.owner as string,
            createdAt: ws.created,
            updatedAt: ws.updated,
          } as Workspace
        })
        .filter((w): w is Workspace => w !== null)

      // 2. Also check if user is the direct owner of any workspace (just in case)
      const owned = await pb.collection('workspaces').getFullList({
        filter: `owner = "${userId}"`,
      })
      
      const ownedWorkspaces = owned.map(ws => ({
        id: ws.id,
        name: ws.name as string,
        owner: ws.owner as string,
        createdAt: ws.created,
        updatedAt: ws.updated,
      } as Workspace))

      // Combine and de-duplicate
      const combined = [...list]
      ownedWorkspaces.forEach(ow => {
        if (!combined.some(c => c.id === ow.id)) {
          combined.push(ow)
        }
      })

      // 3. Auto-provision a default Personal Workspace if they have none
      if (combined.length === 0) {
        const defaultWs = await pb.collection('workspaces').create({
          name: 'Personal Workspace',
          owner: userId,
        })
        
        await pb.collection('workspace_members').create({
          workspace: defaultWs.id,
          user: userId,
          role: 'admin',
        })

        const newWs: Workspace = {
          id: defaultWs.id,
          name: defaultWs.name as string,
          owner: defaultWs.owner as string,
          createdAt: defaultWs.created,
          updatedAt: defaultWs.updated,
        }
        
        setWorkspaces([newWs])
        setActiveWorkspace(newWs)
        localStorage.setItem(`ig_active_ws_${userId}`, defaultWs.id)
      } else {
        setWorkspaces(combined)
        
        // Load active workspace from localStorage, default to first
        const savedId = localStorage.getItem(`ig_active_ws_${userId}`)
        const active = combined.find(w => w.id === savedId) ?? combined[0]
        if (active) {
          setActiveWorkspace(active)
          localStorage.setItem(`ig_active_ws_${userId}`, active.id)
        }
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true)
      fetchWorkspaces(user.id)
    } else {
      setWorkspaces([])
      setActiveWorkspace(null)
      setIsLoading(false)
    }
  }, [user?.id])

  const switchWorkspace = (id: string) => {
    if (!user?.id) return
    const target = workspaces.find(w => w.id === id)
    if (target) {
      setActiveWorkspace(target)
      localStorage.setItem(`ig_active_ws_${user.id}`, id)
    }
  }

  const createWorkspace = async (name: string): Promise<Workspace> => {
    if (!user?.id) throw new Error('Unauthenticated')
    
    // Create workspaces record
    const wsRecord = await pb.collection('workspaces').create({
      name,
      owner: user.id,
    })

    // Create junction member record
    await pb.collection('workspace_members').create({
      workspace: wsRecord.id,
      user: user.id,
      role: 'admin',
    })

    const newWs: Workspace = {
      id: wsRecord.id,
      name: wsRecord.name as string,
      owner: wsRecord.owner as string,
      createdAt: wsRecord.created,
      updatedAt: wsRecord.updated,
    }

    setWorkspaces(prev => [...prev, newWs])
    setActiveWorkspace(newWs)
    localStorage.setItem(`ig_active_ws_${user.id}`, newWs.id)
    return newWs
  }

  const refreshWorkspaces = async () => {
    if (user?.id) {
      await fetchWorkspaces(user.id)
    }
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        isLoading: isLoading || (!!user?.id && !activeWorkspace),
        switchWorkspace,
        createWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
