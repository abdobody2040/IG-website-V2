import { useState, useEffect } from 'react'
import { Settings, Users, Plus, Shield, Trash2, Loader2, Briefcase } from 'lucide-react'
import ClientLayout from './ClientLayout'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../hooks/useAuth'
import { useWorkspace } from '../../hooks/useWorkspace'
import toast from 'react-hot-toast'
import type { RecordModel } from 'pocketbase'

interface Member {
  id: string
  userId: string
  email: string
  displayName: string
  role: 'admin' | 'member' | 'viewer'
  joinedAt: string
}

export default function WorkspaceSettingsPage() {
  const { user } = useAuth()
  const { activeWorkspace, refreshWorkspaces } = useWorkspace()
  const [workspaceName, setWorkspaceName] = useState('')
  const [savingName, setSavingName] = useState(false)

  // Members state
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member')
  const [inviting, setInviting] = useState(false)

  const isOwner = activeWorkspace?.owner === user?.id

  // Load workspace info and members
  useEffect(() => {
    if (!activeWorkspace) return
    setWorkspaceName(activeWorkspace.name)
    loadMembers()
  }, [activeWorkspace?.id])

  const loadMembers = async () => {
    if (!activeWorkspace?.id) return
    setLoadingMembers(true)
    try {
      const result = await pb.collection('workspace_members').getFullList({
        filter: `workspace = "${activeWorkspace.id}"`,
        expand: 'user',
      })
      
      const mapped = result.map(m => {
        const u = m.expand?.user as RecordModel | undefined
        return {
          id: m.id,
          userId: m.user as string,
          email: u?.email as string || 'Unknown',
          displayName: u?.display_name as string || u?.email?.split('@')[0] || 'Unknown',
          role: m.role as Member['role'],
          joinedAt: m.created,
        }
      })
      
      setMembers(mapped)
    } catch (err) {
      console.error('Failed to load members:', err)
      toast.error('Failed to load workspace members')
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWorkspace?.id || !workspaceName.trim()) return
    setSavingName(true)
    try {
      await pb.collection('workspaces').update(activeWorkspace.id, {
        name: workspaceName.trim(),
      })
      toast.success('Workspace name updated')
      await refreshWorkspaces()
    } catch {
      toast.error('Failed to update workspace name')
    } finally {
      setSavingName(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeWorkspace?.id || !inviteEmail.trim()) return
    setInviting(true)
    try {
      // 1. Check if user exists in the system
      let targetUser: RecordModel | null = null
      try {
        const usersList = await pb.collection('users').getList(1, 1, {
          filter: `email = "${inviteEmail.trim()}"`,
        })
        if (usersList.items.length > 0) {
          targetUser = usersList.items[0] ?? null
        }
      } catch (err) {
        console.error('Error searching user:', err)
      }

      if (!targetUser) {
        toast.error('No user found with this email. Please ask them to sign up first.')
        return
      }

      // 2. Check if already a member
      const alreadyMember = members.some(m => m.userId === targetUser?.id)
      if (alreadyMember) {
        toast.error('User is already a member of this workspace')
        return
      }

      // 3. Add user to workspace_members
      await pb.collection('workspace_members').create({
        workspace: activeWorkspace.id,
        user: targetUser.id,
        role: inviteRole,
      })

      toast.success('Member added successfully!')
      setInviteEmail('')
      setInviteRole('member')
      loadMembers()
    } catch (err) {
      console.error(err)
      toast.error('Failed to add member')
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this workspace?`)) return
    try {
      await pb.collection('workspace_members').delete(memberId)
      toast.success('Member removed')
      loadMembers()
    } catch {
      toast.error('Failed to remove member')
    }
  }

  if (!activeWorkspace) {
    return (
      <ClientLayout currentPath="/client/workspace-settings" title="Workspace Settings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#1a56ff]" size={24} />
        </div>
      </ClientLayout>
    )
  }

  return (
    <ClientLayout currentPath="/client/workspace-settings" title="Workspace Settings">
      <div className="max-w-4xl space-y-6">
        <div className="mb-6 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-[#1a56ff]" />
          <h2 className="text-xl font-bold text-slate-900">Workspace Settings</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workspace Profile */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                <Settings size={15} className="text-[#1a56ff]" />
                <h3 className="text-base font-semibold text-slate-900">Workspace Profile</h3>
              </div>
              <form onSubmit={handleUpdateName} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Workspace Name</label>
                  <input
                    type="text"
                    disabled={!isOwner}
                    value={workspaceName}
                    onChange={e => setWorkspaceName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff] disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  {!isOwner && (
                    <p className="text-xs text-slate-400 mt-1">Only the workspace owner can change its name.</p>
                  )}
                </div>
                {isOwner && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingName || workspaceName.trim() === activeWorkspace.name}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#1a56ff] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {savingName && <Loader2 size={14} className="animate-spin" />}
                      Save Details
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Workspace Members */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Users size={15} className="text-[#1a56ff]" />
                  <h3 className="text-base font-semibold text-slate-900">Workspace Members</h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">{members.length} members</span>
              </div>
              
              <div className="p-5">
                {loadingMembers ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin text-[#1a56ff]" size={20} />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="pb-3 pr-4">User</th>
                          <th className="pb-3 px-4">Role</th>
                          <th className="pb-3 px-4">Joined At</th>
                          {isOwner && <th className="pb-3 pl-4 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {members.map(member => (
                          <tr key={member.id} className="group hover:bg-slate-50/50">
                            <td className="py-3.5 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-50 text-[#1a56ff] border border-blue-100 flex items-center justify-center font-bold text-xs">
                                  {member.displayName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                                    {member.displayName}
                                    {member.userId === activeWorkspace.owner && (
                                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Owner</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-700 capitalize">
                              {member.role}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </td>
                            {isOwner && (
                              <td className="py-3.5 pl-4 text-right">
                                {member.userId !== user?.id && (
                                  <button
                                    onClick={() => handleRemoveMember(member.id, member.displayName)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Forms */}
          <div className="space-y-6">
            {/* Invite Member */}
            {isOwner && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                  <Plus size={15} className="text-[#1a56ff]" />
                  <h3 className="text-base font-semibold text-slate-900">Add Member</h3>
                </div>
                <form onSubmit={handleAddMember} className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Workspace Role</label>
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value as any)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]"
                    >
                      <option value="member">Member (Read & Write)</option>
                      <option value="admin">Admin (Full access)</option>
                      <option value="viewer">Viewer (Read Only)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a56ff] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {inviting && <Loader2 size={14} className="animate-spin" />}
                    Add Member
                  </button>
                </form>
              </div>
            )}

            {/* Help / Roles Description */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <Shield size={14} className="text-[#1a56ff]" />
                Workspace Roles
              </h4>
              <div className="space-y-2.5 text-xs text-slate-500">
                <p>
                  <strong className="text-slate-700">Admin:</strong> Has full access to manage all companies, orders, and documents in the workspace.
                </p>
                <p>
                  <strong className="text-slate-700">Member:</strong> Can edit company profiles and download documents, but cannot invite or remove members.
                </p>
                <p>
                  <strong className="text-slate-700">Viewer:</strong> Has read-only access. Can download documents and check progress statuses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}
