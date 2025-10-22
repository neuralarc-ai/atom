ALTER TABLE `candidates` MODIFY COLUMN `score` int;--> statement-breakpoint
ALTER TABLE `candidates` ADD `totalQuestions` int;--> statement-breakpoint
ALTER TABLE `candidates` ADD `status` enum('in_progress','completed','locked_out','reappearance_requested') DEFAULT 'in_progress' NOT NULL;--> statement-breakpoint
ALTER TABLE `candidates` ADD `lockoutReason` text;--> statement-breakpoint
ALTER TABLE `candidates` ADD `videoRecordingUrl` text;--> statement-breakpoint
ALTER TABLE `candidates` ADD `eyeTrackingData` text;--> statement-breakpoint
ALTER TABLE `candidates` ADD `reappearanceRequestedAt` timestamp;--> statement-breakpoint
ALTER TABLE `candidates` ADD `reappearanceApprovedAt` timestamp;--> statement-breakpoint
ALTER TABLE `candidates` ADD `reappearanceApprovedBy` varchar(64);