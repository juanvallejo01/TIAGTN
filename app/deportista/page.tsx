import { getPsychologists } from '@/app/actions/users'
import { DeportistaPageClient } from './deportista-page-client'

export default async function DeportistaPage() {
  const psychologists = await getPsychologists()
  return <DeportistaPageClient psychologists={psychologists} />
}
