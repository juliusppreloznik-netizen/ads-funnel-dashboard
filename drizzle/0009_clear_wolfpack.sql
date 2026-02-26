CREATE TABLE `changeRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` text NOT NULL,
	`page` varchar(255),
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('pending','in_progress','done') NOT NULL DEFAULT 'pending',
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `changeRequests_id` PRIMARY KEY(`id`)
);
