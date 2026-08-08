import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { WorkspaceProvider } from './hooks/useWorkspace'
import CookieConsentBanner from './components/CookieConsentBanner'

export default function App() {
  return (
    <WorkspaceProvider>
      <RouterProvider router={router} />
      <CookieConsentBanner />
    </WorkspaceProvider>
  )
}
