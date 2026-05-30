'use server'

import { db } from '@/lib/db'
import { notifications, type Notification } from '@/lib/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getNotificationsByAthleteId(athleteId: number): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.athleteId, athleteId))
    .orderBy(desc(notifications.createdAt))
}

export async function getUnreadNotificationCount(athleteId: number): Promise<number> {
  const result = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.athleteId, athleteId), eq(notifications.leida, false)))
  return result.length
}

export async function markNotificationAsRead(id: number): Promise<Notification | null> {
  const result = await db
    .update(notifications)
    .set({ leida: true })
    .where(eq(notifications.id, id))
    .returning()
  revalidatePath('/deportista/dashboard')
  return result[0] || null
}

export async function markAllNotificationsAsRead(athleteId: number): Promise<void> {
  await db
    .update(notifications)
    .set({ leida: true })
    .where(eq(notifications.athleteId, athleteId))
  revalidatePath('/deportista/dashboard')
}
