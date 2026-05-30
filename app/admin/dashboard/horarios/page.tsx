import { getSchedules } from '@/app/actions/schedules'
import { HorariosClient } from './horarios-client'

export default async function HorariosPage() {
  const schedules = await getSchedules()
  
  return <HorariosClient initialSchedules={schedules} />
}
