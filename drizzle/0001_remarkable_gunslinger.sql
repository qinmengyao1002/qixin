CREATE TABLE `gestures` (
	`id` text PRIMARY KEY NOT NULL,
	`sender` text NOT NULL,
	`target` text NOT NULL,
	`room` text NOT NULL,
	`area` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `gesture_target` ON `gestures` (`target`,`created`);