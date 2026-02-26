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
