ALTER TABLE `generatedAssets` MODIFY COLUMN `assetType` enum('vsl','ads','landing_page','landing_page_html','thankyou_page_html','survey_css') NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `ghlApiToken` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `ghlLocationId` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `funnelAccentColor` varchar(50);