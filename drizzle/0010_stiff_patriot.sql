CREATE TABLE `helpVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`youtubeUrl` varchar(500) NOT NULL,
	`videoId` varchar(50) NOT NULL,
	`category` varchar(100) NOT NULL,
	`tags` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `helpVideos_id` PRIMARY KEY(`id`)
);
