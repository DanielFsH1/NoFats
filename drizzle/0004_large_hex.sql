CREATE TABLE "rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"scope" text NOT NULL,
	"identifier_hash" text NOT NULL,
	"action" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"window_seconds" integer NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"blocked_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limits_lookup_idx" ON "rate_limits" USING btree ("scope","identifier_hash","action","window_start");--> statement-breakpoint
CREATE INDEX "rate_limits_updated_idx" ON "rate_limits" USING btree ("updated_at");