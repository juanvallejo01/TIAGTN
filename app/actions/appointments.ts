'use server'

import { db } from '@/lib/db'
import { appointments, athletes, notifications, type Appointment, type NewAppointment } from '@/lib/db/schema'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type AppointmentWithAthlete = Appointment & {
  athlete: {
    id: number
    nombre: string
    apellido: string
    cedula: string
    deporte: string
    telefono: string | null
    email: string | null
  }
}

export async function getAppointments(filters?: {
  estado?: string
  fecha?: string
  athleteId?: number
}): Promise<AppointmentWithAthlete[]> {
  let query = db
    .select({
      id: appointments.id,
      athleteId: appointments.athleteId,
      fecha: appointments.fecha,
      horaInicio: appointments.horaInicio,
      horaFin: appointments.horaFin,
      motivo: appointments.motivo,
      estado: appointments.estado,
      notas: appointments.notas,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      athlete: {
        id: athletes.id,
        nombre: athletes.nombre,
        apellido: athletes.apellido,
        cedula: athletes.cedula,
        deporte: athletes.deporte,
        telefono: athletes.telefono,
        email: athletes.email,
      },
    })
    .from(appointments)
    .innerJoin(athletes, eq(appointments.athleteId, athletes.id))
    .orderBy(desc(appointments.fecha), desc(appointments.horaInicio))

  const conditions = []
  
  if (filters?.estado) {
    conditions.push(eq(appointments.estado, filters.estado))
  }
  if (filters?.fecha) {
    conditions.push(eq(appointments.fecha, filters.fecha))
  }
  if (filters?.athleteId) {
    conditions.push(eq(appointments.athleteId, filters.athleteId))
  }

  if (conditions.length > 0) {
    return query.where(and(...conditions))
  }
  
  return query
}

export async function getAppointmentsByAthleteId(athleteId: number): Promise<Appointment[]> {
  return db
    .select()
    .from(appointments)
    .where(eq(appointments.athleteId, athleteId))
    .orderBy(desc(appointments.fecha), desc(appointments.horaInicio))
}

export async function getAppointmentById(id: number): Promise<AppointmentWithAthlete | null> {
  const result = await db
    .select({
      id: appointments.id,
      athleteId: appointments.athleteId,
      fecha: appointments.fecha,
      horaInicio: appointments.horaInicio,
      horaFin: appointments.horaFin,
      motivo: appointments.motivo,
      estado: appointments.estado,
      notas: appointments.notas,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      athlete: {
        id: athletes.id,
        nombre: athletes.nombre,
        apellido: athletes.apellido,
        cedula: athletes.cedula,
        deporte: athletes.deporte,
        telefono: athletes.telefono,
        email: athletes.email,
      },
    })
    .from(appointments)
    .innerJoin(athletes, eq(appointments.athleteId, athletes.id))
    .where(eq(appointments.id, id))
  return result[0] || null
}

export async function createAppointment(data: Omit<NewAppointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
  const result = await db.insert(appointments).values(data).returning()
  revalidatePath('/admin/solicitudes')
  revalidatePath('/admin/calendario')
  revalidatePath('/deportista/dashboard')
  return result[0]
}

export async function updateAppointmentStatus(
  id: number,
  estado: 'confirmada' | 'rechazada' | 'cancelada' | 'completada',
  notas?: string
): Promise<Appointment | null> {
  const appointment = await db.select().from(appointments).where(eq(appointments.id, id))
  if (!appointment[0]) return null

  const result = await db
    .update(appointments)
    .set({ estado, notas, updatedAt: new Date() })
    .where(eq(appointments.id, id))
    .returning()

  // Create notification for the athlete
  const mensajes: Record<string, string> = {
    confirmada: 'Tu cita ha sido confirmada',
    rechazada: `Tu cita ha sido rechazada${notas ? `: ${notas}` : ''}`,
    cancelada: 'Tu cita ha sido cancelada',
    completada: 'Tu cita ha sido marcada como completada',
  }

  await db.insert(notifications).values({
    athleteId: appointment[0].athleteId,
    mensaje: mensajes[estado],
    tipo: estado === 'confirmada' ? 'confirmacion' : estado === 'rechazada' ? 'rechazo' : 'recordatorio',
  })

  revalidatePath('/admin/solicitudes')
  revalidatePath('/admin/calendario')
  revalidatePath('/deportista/dashboard')
  
  return result[0] || null
}

export async function getAppointmentsForWeek(startDate: string, endDate: string): Promise<AppointmentWithAthlete[]> {
  return db
    .select({
      id: appointments.id,
      athleteId: appointments.athleteId,
      fecha: appointments.fecha,
      horaInicio: appointments.horaInicio,
      horaFin: appointments.horaFin,
      motivo: appointments.motivo,
      estado: appointments.estado,
      notas: appointments.notas,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      athlete: {
        id: athletes.id,
        nombre: athletes.nombre,
        apellido: athletes.apellido,
        cedula: athletes.cedula,
        deporte: athletes.deporte,
        telefono: athletes.telefono,
        email: athletes.email,
      },
    })
    .from(appointments)
    .innerJoin(athletes, eq(appointments.athleteId, athletes.id))
    .where(and(gte(appointments.fecha, startDate), lte(appointments.fecha, endDate)))
    .orderBy(appointments.fecha, appointments.horaInicio)
}

export async function getAppointmentStats() {
  const today = new Date().toISOString().split('T')[0]
  
  const [total, pendientes, confirmadas, hoy] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(appointments),
    db.select({ count: sql<number>`count(*)` }).from(appointments).where(eq(appointments.estado, 'pendiente')),
    db.select({ count: sql<number>`count(*)` }).from(appointments).where(eq(appointments.estado, 'confirmada')),
    db.select({ count: sql<number>`count(*)` }).from(appointments).where(eq(appointments.fecha, today)),
  ])

  return {
    total: Number(total[0]?.count) || 0,
    pendientes: Number(pendientes[0]?.count) || 0,
    confirmadas: Number(confirmadas[0]?.count) || 0,
    hoy: Number(hoy[0]?.count) || 0,
  }
}

export async function getBlockedSlots(): Promise<{ fecha: string; horaInicio: string }[]> {
  return db
    .select({ fecha: appointments.fecha, horaInicio: appointments.horaInicio })
    .from(appointments)
    .where(
      sql`${appointments.estado} IN ('pendiente', 'confirmada')`
    )
}

export async function getConfirmedAppointmentsForRange(startDate: string, endDate: string): Promise<AppointmentWithAthlete[]> {
  return db
    .select({
      id: appointments.id,
      athleteId: appointments.athleteId,
      fecha: appointments.fecha,
      horaInicio: appointments.horaInicio,
      horaFin: appointments.horaFin,
      motivo: appointments.motivo,
      estado: appointments.estado,
      notas: appointments.notas,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      athlete: {
        id: athletes.id,
        nombre: athletes.nombre,
        apellido: athletes.apellido,
        cedula: athletes.cedula,
        deporte: athletes.deporte,
        telefono: athletes.telefono,
        email: athletes.email,
      },
    })
    .from(appointments)
    .innerJoin(athletes, eq(appointments.athleteId, athletes.id))
    .where(
      and(
        gte(appointments.fecha, startDate),
        lte(appointments.fecha, endDate),
        eq(appointments.estado, 'confirmada')
      )
    )
    .orderBy(appointments.fecha, appointments.horaInicio)
}

export async function getUpcomingAppointments(days = 7): Promise<AppointmentWithAthlete[]> {
  const today = new Date()
  const future = new Date()
  future.setDate(today.getDate() + days)
  return getConfirmedAppointmentsForRange(
    today.toISOString().split('T')[0],
    future.toISOString().split('T')[0]
  )
}

export async function checkSlotAvailability(fecha: string, horaInicio: string, horaFin: string): Promise<boolean> {
  const existing = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.fecha, fecha),
        eq(appointments.horaInicio, horaInicio),
        eq(appointments.estado, 'confirmada')
      )
    )
  return existing.length === 0
}
