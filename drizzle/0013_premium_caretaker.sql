CREATE TABLE `appSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `appSettings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
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
--> statement-breakpoint
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
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` varchar(320) NOT NULL,
	`businessName` text NOT NULL,
	`ghlEmail` varchar(320),
	`ghlPassword` text,
	`driveLink` text,
	`password` varchar(255),
	`archived` int NOT NULL DEFAULT 0,
	`ghlApiToken` text,
	`ghlLocationId` varchar(255),
	`funnelAccentColor` varchar(50),
	`funnelSecondaryColor` varchar(50),
	`templateUsed` varchar(10),
	`backgroundTreatment` varchar(50),
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funnels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`name` varchar(255) NOT NULL,
	`mechanism` text,
	`color` varchar(50),
	`landingHtml` text,
	`thankyouHtml` text,
	`editorData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funnels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generatedAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`assetType` enum('vsl','ads','landing_page','landing_page_html','thankyou_page_html','survey_css') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generatedAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
--> statement-breakpoint
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
