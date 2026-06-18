import { pgTable, text, timestamp, boolean, serial, integer, time, date } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------

export const athletes = pgTable('athletes', {
  id: serial('id').primaryKey(),
  cedula: text('cedula').notNull().unique(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  deporte: text('deporte').notNull(),
  categoria: text('categoria').notNull().default(''),
  telefono: text('telefono'),
  email: text('email'),
  activo: boolean('activo').notNull().default(true),
  psychologistId: text('psychologistId').references(() => user.id),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  diaSemana: integer('diaSemana').notNull(), // 0=Sunday, 1=Monday, etc.
  horaInicio: time('horaInicio').notNull(),
  horaFin: time('horaFin').notNull(),
  activo: boolean('activo').notNull().default(true),
  psychologistId: text('psychologistId').references(() => user.id),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  athleteId: integer('athleteId').notNull(),
  fecha: date('fecha').notNull(),
  horaInicio: time('horaInicio').notNull(),
  horaFin: time('horaFin').notNull(),
  motivo: text('motivo'),
  estado: text('estado').notNull().default('pendiente'), // pendiente, confirmada, rechazada, cancelada, completada
  notas: text('notas'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  athleteId: integer('athleteId').notNull(),
  mensaje: text('mensaje').notNull(),
  tipo: text('tipo').notNull(), // confirmacion, rechazo, recordatorio
  leida: boolean('leida').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Type exports
export type Athlete = typeof athletes.$inferSelect
export type NewAthlete = typeof athletes.$inferInsert
export type Schedule = typeof schedules.$inferSelect
export type NewSchedule = typeof schedules.$inferInsert
export type Appointment = typeof appointments.$inferSelect
export type NewAppointment = typeof appointments.$inferInsert
export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
