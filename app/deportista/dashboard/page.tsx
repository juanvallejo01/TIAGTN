import { redirect } from 'next/navigation'
import { getAthleteById } from '@/app/actions/athletes'
import { getAppointmentsByAthleteId, getBlockedSlots } from '@/app/actions/appointments'
import { getNotificationsByAthleteId } from '@/app/actions/notifications'
import { getActiveSchedules } from '@/app/actions/schedules'
import { AthleteDashboardClient } from './athlete-dashboard-client'

interface PageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function AthleteDashboard({ searchParams }: PageProps) {
  const params = await searchParams
  const athleteId = params.id ? parseInt(params.id) : null

  if (!athleteId) redirect('/deportista')

  const athlete = await getAthleteById(athleteId)
  if (!athlete || !athlete.activo) redirect('/deportista')

  const pid = athlete.psychologistId ?? undefined

  const [appointments, notifications, schedules, blockedSlots] = await Promise.all([
    getAppointmentsByAthleteId(athleteId),
    getNotificationsByAthleteId(athleteId),
    getActiveSchedules(pid),
    getBlockedSlots(pid),
  ])

  return (
    <AthleteDashboardClient
      athlete={athlete}
      initialAppointments={appointments}
      initialNotifications={notifications}
      schedules={schedules}
      blockedSlots={blockedSlots}
    />
  )
}
