'use server'

import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'

export type Psychologist = { id: string; name: string; email: string }

export async function getPsychologists(): Promise<Psychologist[]> {
  return db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .orderBy(asc(user.name))
}
