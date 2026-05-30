import { format, startOfWeek, addDays } from 'date-fns'
import { getConfirmedAppointmentsForRange } from '@/app/actions/appointments'
import { getActiveSchedules } from '@/app/actions/schedules'
import { CalendarioClient } from './calendario-client'

export default async function CalendarioPage() {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)

  const [appointments, schedules] = await Promise.all([
    getConfirmedAppointmentsForRange(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd')),
    getActiveSchedules(),
  ])

  return <CalendarioClient initialAppointments={appointments} schedules={schedules} />
}
