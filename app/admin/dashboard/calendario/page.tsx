import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { format, startOfWeek, addDays } from 'date-fns'
import { getConfirmedAppointmentsForRange } from '@/app/actions/appointments'
import { getActiveSchedules } from '@/app/actions/schedules'
import { CalendarioClient } from './calendario-client'

export default async function CalendarioPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)

  const [appointments, schedules] = await Promise.all([
    getConfirmedAppointmentsForRange(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd'), userId),
    getActiveSchedules(userId),
  ])

  return <CalendarioClient initialAppointments={appointments} schedules={schedules} psychologistId={userId} />
}
