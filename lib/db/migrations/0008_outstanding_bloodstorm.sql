ALTER TABLE "Message" ADD COLUMN "factCheck" json;--> statement-breakpoint
ALTER TABLE "Message" ADD COLUMN "confidence" integer;--> statement-breakpoint
ALTER TABLE "Message" ADD COLUMN "perspectiveReasoning" text;