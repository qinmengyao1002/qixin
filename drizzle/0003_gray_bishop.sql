CREATE TABLE `lantern_rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`room` text NOT NULL,
	`area` text NOT NULL,
	`name` text NOT NULL,
	`starts` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lantern_round_place` ON `lantern_rounds` (`room`,`area`);--> statement-breakpoint
CREATE TABLE `river_lanterns` (
	`id` text PRIMARY KEY NOT NULL,
	`visitor` text NOT NULL,
	`room` text NOT NULL,
	`area` text NOT NULL,
	`name` text NOT NULL,
	`wish` text NOT NULL,
	`starts` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `lantern_room` ON `river_lanterns` (`room`,`area`,`starts`);--> statement-breakpoint
CREATE INDEX `lantern_visitor` ON `river_lanterns` (`visitor`,`created`);