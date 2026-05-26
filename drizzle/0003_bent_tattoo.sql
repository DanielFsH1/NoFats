ALTER TYPE "public"."proposal_type" ADD VALUE 'REMOVE_IMAGE' BEFORE 'REMOVE_POST';--> statement-breakpoint
ALTER TABLE "nicknames" ADD COLUMN "approved_via_proposal_id" text;