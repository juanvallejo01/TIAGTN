-- Migration 002: Add psychologistId to athletes and schedules
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS "psychologistId" TEXT REFERENCES "user"("id");
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS "psychologistId" TEXT REFERENCES "user"("id");
