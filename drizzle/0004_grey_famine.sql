ALTER TABLE `tests` ADD `shortCode` varchar(10);--> statement-breakpoint
ALTER TABLE `tests` ADD CONSTRAINT `tests_shortCode_unique` UNIQUE(`shortCode`);