import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appointments, athletes, notifications } from '@/lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { format } from 'date-fns'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  // Window: appointments starting between 55 and 75 minutes from now
  const in55 = new Date(now.getTime() + 55 * 60 * 1000)
  const in75 = new Date(now.getTime() + 75 * 60 * 1000)
  const todayStr = format(now, 'yyyy-MM-dd')
  const time55 = format(in55, 'HH:mm:ss')
  const time75 = format(in75, 'HH:mm:ss')
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const upcoming = await db
    .select({
      id: appointments.id,
      athleteId: appointments.athleteId,
      horaInicio: appointments.horaInicio,
    })
    .from(appointments)
    .innerJoin(athletes, eq(appointments.athleteId, athletes.id))
    .where(
      and(
        eq(appointments.estado, 'confirmada'),
        eq(appointments.fecha, todayStr),
        gte(appointments.horaInicio, time55),
        lte(appointments.horaInicio, time75),
      )
    )

  let sent = 0

  for (const apt of upcoming) {
    // Skip if a reminder was already sent today for this athlete
    const existing = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.athleteId, apt.athleteId),
          eq(notifications.tipo, 'recordatorio'),
          gte(notifications.createdAt, startOfToday),
        )
      )

    if (existing.length > 0) continue

    await db.insert(notifications).values({
      athleteId: apt.athleteId,
      mensaje: `Recordatorio: tienes una cita confirmada en 1 hora, a las ${apt.horaInicio.slice(0, 5)}.`,
      tipo: 'recordatorio',
    })
    sent++
  }

  return NextResponse.json({ checked: upcoming.length, sent })
}
