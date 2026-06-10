import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { Pool } from 'pg'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

// pg Pool — usado exclusivamente por better-auth (requiere API de pg.Pool)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
})
