CREATE TABLE `candidates` (
	`id` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`email` varchar(320) NOT NULL,
	`testId` varchar(64) NOT NULL,
	`answers` text,
	`score` varchar(10),
	`startedAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `candidates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`experience` varchar(100) NOT NULL,
	`skills` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tests` (
	`id` varchar(64) NOT NULL,
	`jobId` varchar(64) NOT NULL,
	`complexity` enum('low','medium','high') NOT NULL,
	`questions` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `tests_id` PRIMARY KEY(`id`)
);
