CREATE TABLE `content` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `screens` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`mdns_hostname` text NOT NULL UNIQUE,
	`ip` text,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`group_name` text,
	`position_description` text,
	`display_order` integer,
	`note` text,
	`default_content_id` integer,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	CONSTRAINT `fk_screens_default_content_id_content_id_fk` FOREIGN KEY (`default_content_id`) REFERENCES `content`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`fahrenheit_temps` integer DEFAULT true NOT NULL,
	`memory_warn_percent` integer DEFAULT 85 NOT NULL,
	`memory_urgent_percent` integer DEFAULT 95 NOT NULL
);
