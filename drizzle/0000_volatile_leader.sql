CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor` text NOT NULL,
	`room` text NOT NULL,
	`color` text NOT NULL,
	`starts` integer NOT NULL,
	`ends` integer NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ticket_visitor` ON `tickets` (`visitor`);--> statement-breakpoint
CREATE TABLE `visitors` (
	`id` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`room` text NOT NULL,
	`area` text NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`x` real NOT NULL,
	`z` real NOT NULL,
	`yaw` real NOT NULL,
	`action` text NOT NULL,
	`seat` integer,
	`seen` integer NOT NULL,
	`invite_at` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `visitor_seat` ON `visitors` (`room`,`area`,`seat`);--> statement-breakpoint
CREATE INDEX `visitor_room` ON `visitors` (`room`,`seen`);