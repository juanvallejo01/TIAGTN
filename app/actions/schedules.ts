'use server'

import { db } from '@/lib/db'
import { schedules, type Schedule, type NewSchedule } from '@/lib/db/schema'
import { eq, asc, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getSchedules(psychologistId?: string): Promise<Schedule[]> {
  if (psychologistId) {
    return db
      .select()
      .from(schedules)
      .where(eq(schedules.psychologistId, psychologistId))
      .orderBy(asc(schedules.diaSemana), asc(schedules.horaInicio))
  }
  return db.select().from(schedules).orderBy(asc(schedules.diaSemana), asc(schedules.horaInicio))
}

export async function getActiveSchedules(psychologistId?: string): Promise<Schedule[]> {
  if (psychologistId) {
    return db
      .select()
      .from(schedules)
      .where(and(eq(schedules.activo, true), eq(schedules.psychologistId, psychologistId)))
      .orderBy(asc(schedules.diaSemana), asc(schedules.horaInicio))
  }
  return db
    .select()
    .from(schedules)
    .where(eq(schedules.activo, true))
    .orderBy(asc(schedules.diaSemana), asc(schedules.horaInicio))
}

export async function getScheduleById(id: number): Promise<Schedule | null> {
  const result = await db.select().from(schedules).where(eq(schedules.id, id))
  return result[0] || null
}

export async function createSchedule(data: Omit<NewSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
  const result = await db.insert(schedules).values(data).returning()
  revalidatePath('/admin/horarios')
  return result[0]
}

export async function updateSchedule(id: number, data: Partial<NewSchedule>): Promise<Schedule | null> {
  const result = await db
    .update(schedules)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schedules.id, id))
    .returning()
  revalidatePath('/admin/horarios')
  return result[0] || null
}

export async function deleteSchedule(id: number): Promise<boolean> {
  await db.delete(schedules).where(eq(schedules.id, id))
  revalidatePath('/admin/horarios')
  return true
}

export async function toggleScheduleStatus(id: number): Promise<Schedule | null> {
  const schedule = await getScheduleById(id)
  if (!schedule) return null

  const result = await db
    .update(schedules)
    .set({ activo: !schedule.activo, updatedAt: new Date() })
    .where(eq(schedules.id, id))
    .returning()
  revalidatePath('/admin/horarios')
  return result[0] || null
}
