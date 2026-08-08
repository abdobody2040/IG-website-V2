import ClientLayout from './ClientLayout'
import TrackingMainPage from '../../components/tracking/TrackingMainPage'

export default function ClientTrackingPage() {
  return (
    <ClientLayout currentPath="/client/tracking" title="Tracking & Analytics">
      <TrackingMainPage />
    </ClientLayout>
  )
}
