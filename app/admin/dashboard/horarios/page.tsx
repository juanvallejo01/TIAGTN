import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getSchedules } from '@/app/actions/schedules'
import { HorariosClient } from './horarios-client'

export default async function HorariosPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id
  const schedules = await getSchedules(userId)
  return <HorariosClient initialSchedules={schedules} psychologistId={userId} />
}
