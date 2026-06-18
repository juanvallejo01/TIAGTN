import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getAppointments } from '@/app/actions/appointments'
import { SolicitudesClient } from './solicitudes-client'

export default async function SolicitudesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id
  const appointments = await getAppointments({ psychologistId: userId })
  return <SolicitudesClient initialAppointments={appointments} psychologistId={userId} />
}
