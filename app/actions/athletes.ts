'use server'

import { db } from '@/lib/db'
import { athletes, type Athlete, type NewAthlete } from '@/lib/db/schema'
import { eq, ilike, or, desc, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getAthletes(psychologistId?: string): Promise<Athlete[]> {
  if (psychologistId) {
    return db
      .select()
      .from(athletes)
      .where(eq(athletes.psychologistId, psychologistId))
      .orderBy(desc(athletes.createdAt))
  }
  return db.select().from(athletes).orderBy(desc(athletes.createdAt))
}

export async function getAthleteById(id: number): Promise<Athlete | null> {
  const result = await db.select().from(athletes).where(eq(athletes.id, id))
  return result[0] || null
}

export async function getAthleteByCedula(cedula: string): Promise<Athlete | null> {
  const result = await db.select().from(athletes).where(eq(athletes.cedula, cedula))
  return result[0] || null
}

export async function createAthlete(data: Omit<NewAthlete, 'id' | 'createdAt' | 'updatedAt'>): Promise<Athlete> {
  const result = await db.insert(athletes).values(data).returning()
  revalidatePath('/admin/deportistas')
  return result[0]
}

export async function updateAthlete(id: number, data: Partial<NewAthlete>): Promise<Athlete | null> {
  const result = await db
    .update(athletes)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(athletes.id, id))
    .returning()
  revalidatePath('/admin/deportistas')
  return result[0] || null
}

export async function deleteAthlete(id: number): Promise<boolean> {
  await db.delete(athletes).where(eq(athletes.id, id))
  revalidatePath('/admin/deportistas')
  return true
}

export async function toggleAthleteStatus(id: number): Promise<Athlete | null> {
  const athlete = await getAthleteById(id)
  if (!athlete) return null

  const result = await db
    .update(athletes)
    .set({ activo: !athlete.activo, updatedAt: new Date() })
    .where(eq(athletes.id, id))
    .returning()
  revalidatePath('/admin/deportistas')
  return result[0] || null
}
