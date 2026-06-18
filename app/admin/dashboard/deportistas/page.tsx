import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getAthletes } from '@/app/actions/athletes'
import { AthletesClient } from './athletes-client'

export default async function DeportistasPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session!.user.id
  const athletes = await getAthletes(userId)
  return <AthletesClient initialAthletes={athletes} psychologistId={userId} />
}
