CREATE TABLE `clientTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`taskName` varchar(255) NOT NULL,
	`taskOrder` int NOT NULL,
	`status` enum('not_started','in_progress','done') NOT NULL DEFAULT 'not_started',
	`internalNotes` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `clients` ADD `password` varchar(255);