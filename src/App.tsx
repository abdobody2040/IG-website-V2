import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { WorkspaceProvider } from './hooks/useWorkspace'

export default function App() {
  return (
    <WorkspaceProvider>
      <RouterProvider router={router} />
    </WorkspaceProvider>
  )
}
