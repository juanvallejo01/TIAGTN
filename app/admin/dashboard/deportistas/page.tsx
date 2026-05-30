import { getAthletes } from '@/app/actions/athletes'
import { AthletesClient } from './athletes-client'

export default async function DeportistasPage() {
  const athletes = await getAthletes()
  
  return <AthletesClient initialAthletes={athletes} />
}
