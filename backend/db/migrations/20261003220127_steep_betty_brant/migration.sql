CREATE TABLE `screen_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`hidden` integer DEFAULT false NOT NULL,
	`pretty_name` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `screens` ADD `group_id` integer REFERENCES screen_groups(id) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `screens` DROP COLUMN `group_name`;