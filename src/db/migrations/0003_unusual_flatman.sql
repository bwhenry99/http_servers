ALTER TABLE "refresh_tokens" ALTER COLUMN "expires_at" SET DEFAULT '2026-07-12 00:06:42.992';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_chirpy_red" boolean DEFAULT false;