import { getAppointments } from '@/app/actions/appointments'
import { SolicitudesClient } from './solicitudes-client'

export default async function SolicitudesPage() {
  const appointments = await getAppointments()
  
  return <SolicitudesClient initialAppointments={appointments} />
}
