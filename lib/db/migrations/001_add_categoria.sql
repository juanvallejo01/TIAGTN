-- Migration 001: Add categoria column to athletes table
-- Run this once against your PostgreSQL database before deploying
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS "categoria" TEXT NOT NULL DEFAULT '';
