CREATE TABLE `screen_schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`content_id` integer NOT NULL,
	`screen_id` integer NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	CONSTRAINT `fk_screen_schedules_content_id_content_id_fk` FOREIGN KEY (`content_id`) REFERENCES `content`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_screen_schedules_screen_id_screens_id_fk` FOREIGN KEY (`screen_id`) REFERENCES `screens`(`id`) ON DELETE CASCADE
);
