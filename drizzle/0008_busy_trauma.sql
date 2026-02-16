CREATE TABLE `onboardingProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`stepKey` varchar(100) NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboardingProgress_id` PRIMARY KEY(`id`)
);
