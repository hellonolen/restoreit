CREATE TABLE `brand_memory` (
	`id` text PRIMARY KEY NOT NULL,
	`concept` text NOT NULL,
	`memory_content` text NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`business_name` text NOT NULL,
	`website` text NOT NULL,
	`email` text,
	`city` text,
	`phone` text,
	`rating` real,
	`status` text DEFAULT 'new' NOT NULL,
	`generated_subject` text,
	`generated_body` text,
	`agent_memory` text,
	`human_feedback` text,
	`last_contacted_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_website_unique` ON `leads` (`website`);--> statement-breakpoint
CREATE TABLE `partner_briefings` (
	`id` text PRIMARY KEY NOT NULL,
	`business_name` text NOT NULL,
	`website` text NOT NULL,
	`briefing_doc` text NOT NULL,
	`confidence_score` integer,
	`last_updated` integer
);
