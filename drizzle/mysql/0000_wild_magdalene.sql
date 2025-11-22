-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `attachments` (
	`id` varchar(191) NOT NULL,
	`name` varchar(500) NOT NULL,
	`size` varchar(50) NOT NULL,
	`url` text NOT NULL,
	`type` varchar(100) NOT NULL,
	`uploaded_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`uploaded_by_id` varchar(191) NOT NULL,
	`uploaded_by_name` varchar(255) NOT NULL,
	`entity_type` varchar(16) NOT NULL,
	`entity_id` varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` varchar(191) NOT NULL,
	`entity_type` varchar(16) NOT NULL,
	`entity_id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`avatar` text DEFAULT 'NULL',
	`content` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `communities` (
	`id` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text DEFAULT 'NULL',
	`icon` varchar(100) DEFAULT 'NULL',
	`color` varchar(20) DEFAULT '''#6366f1''',
	`visibility` enum('public','private','secret') DEFAULT '''private''',
	`created_by` varchar(50) DEFAULT 'NULL',
	`created_at` timestamp DEFAULT 'current_timestamp()',
	`updated_at` timestamp DEFAULT 'current_timestamp()',
	`is_archived` tinyint(1) DEFAULT 0,
	`archived_at` timestamp DEFAULT 'NULL',
	`settings` longtext DEFAULT 'NULL',
	`members_count` int(11) DEFAULT 0,
	`posts_count` int(11) DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `community_activity` (
	`id` varchar(50) NOT NULL,
	`community_id` varchar(50) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`action` enum('created','updated','deleted','commented','reacted','joined','left','shared','mentioned','pinned','archived') NOT NULL,
	`target_type` enum('post','comment','file','vault_item','member','community','category') NOT NULL,
	`target_id` varchar(50) DEFAULT 'NULL',
	`metadata` longtext DEFAULT 'NULL',
	`created_at` timestamp DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `community_categories` (
	`id` varchar(50) NOT NULL,
	`community_id` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text DEFAULT 'NULL',
	`color` varchar(20) DEFAULT 'NULL',
	`icon` varchar(50) DEFAULT 'NULL',
	`parent_category_id` varchar(50) DEFAULT 'NULL',
	`display_order` int(11) DEFAULT 0,
	`created_at` timestamp DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `community_comments` (
	`id` varchar(50) NOT NULL,
	`post_id` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`author_id` varchar(50) NOT NULL,
	`parent_comment_id` varchar(50) DEFAULT 'NULL',
	`created_at` timestamp DEFAULT 'current_timestamp()',
	`updated_at` timestamp DEFAULT 'current_timestamp()',
	`edited_at` timestamp DEFAULT 'NULL',
	`reactions` longtext DEFAULT 'NULL',
	`mentioned_users` longtext DEFAULT 'NULL',
	`is_deleted` tinyint(1) DEFAULT 0,
	`is_approved` tinyint(1) NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE `community_files` (
	`id` varchar(50) NOT NULL,
	`community_id` varchar(50) NOT NULL,
	`post_id` varchar(50) DEFAULT 'NULL',
	`file_name` varchar(500) NOT NULL,
	`file_path` varchar(1000) NOT NULL,
	`file_type` varchar(100) DEFAULT 'NULL',
	`file_size` bigint(20) DEFAULT 'NULL',
	`mime_type` varchar(100) DEFAULT 'NULL',
	`uploaded_by` varchar(50) NOT NULL,
	`uploaded_at` timestamp DEFAULT 'current_timestamp()',
	`description` text DEFAULT 'NULL',
	`notes` text DEFAULT 'NULL',
	`tags` longtext DEFAULT 'NULL',
	`downloads_count` int(11) DEFAULT 0,
	`is_public` tinyint(1) DEFAULT 0,
	`thumbnail_path` varchar(1000) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `community_members` (
	`id` varchar(50) NOT NULL,
	`community_id` varchar(50) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`role` enum('owner','admin','moderator','editor','contributor','viewer') DEFAULT '''viewer''',
	`custom_permissions` longtext DEFAULT 'NULL',
	`joined_at` timestamp DEFAULT 'current_timestamp()',
	`last_active_at` timestamp DEFAULT 'NULL',
	`is_muted` tinyint(1) DEFAULT 0,
	CONSTRAINT `unique_member` UNIQUE(`community_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `community_posts` (
	`id` varchar(50) NOT NULL,
	`community_id` varchar(50) NOT NULL,
	`title` varchar(300) DEFAULT 'NULL',
	`content` longtext DEFAULT 'NULL',
	`content_type` enum('markdown','rich_text','plain_text') DEFAULT '''markdown''',
	`author_id` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT 'current_timestamp()',
	`updated_at` timestamp DEFAULT 'current_timestamp()',
	`edited_at` timestamp DEFAULT 'NULL',
	`is_pinned` tinyint(1) DEFAULT 0,
	`is_featured` tinyint(1) DEFAULT 0,
	`is_draft` tinyint(1) DEFAULT 0,
	`is_approved` tinyint(1) NOT NULL DEFAULT 1,
	`is_deleted` tinyint(1) DEFAULT 0,
	`views_count` int(11) DEFAULT 0,
	`reactions` longtext DEFAULT 'NULL',
	`tags` longtext DEFAULT 'NULL',
	`mentioned_users` longtext DEFAULT 'NULL',
	`parent_post_id` varchar(50) DEFAULT 'NULL',
	`category_id` varchar(50) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `community_reactions` (
	`id` varchar(100) NOT NULL,
	`post_id` varchar(100) NOT NULL,
	`user_id` varchar(100) NOT NULL,
	`reaction_type` enum('like','love','celebrate','support','insightful','curious') NOT NULL DEFAULT '''like''',
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	CONSTRAINT `unique_user_post_reaction` UNIQUE(`post_id`,`user_id`,`reaction_type`)
);
--> statement-breakpoint
CREATE TABLE `community_stats` (
	`id` varchar(50) DEFAULT 'NULL',
	`members_count` int(11) DEFAULT 'NULL',
	`name` varchar(200) DEFAULT 'NULL',
	`posts_count` int(11) DEFAULT 'NULL',
	`total_comments` bigint(20) DEFAULT 'NULL',
	`total_files` bigint(20) DEFAULT 'NULL',
	`total_posts` bigint(20) DEFAULT 'NULL',
	`total_views` decimal(32,0) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `community_vault` (
	`id` varchar(50) NOT NULL,
	`community_id` varchar(50) NOT NULL,
	`title` varchar(300) NOT NULL,
	`item_type` enum('api_key','password','secret','certificate','token','credentials','other') NOT NULL,
	`encrypted_content` text NOT NULL,
	`encryption_iv` varchar(100) NOT NULL,
	`encryption_tag` varchar(100) DEFAULT 'NULL',
	`description` text DEFAULT 'NULL',
	`tags` longtext DEFAULT 'NULL',
	`created_by` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT 'current_timestamp()',
	`updated_at` timestamp DEFAULT 'current_timestamp()',
	`expires_at` timestamp DEFAULT 'NULL',
	`access_count` int(11) DEFAULT 0,
	`last_accessed_at` timestamp DEFAULT 'NULL',
	`last_accessed_by` varchar(50) DEFAULT 'NULL',
	`allowed_roles` longtext DEFAULT 'NULL',
	`allowed_users` longtext DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `community_vault_access_log` (
	`id` varchar(50) NOT NULL,
	`vault_item_id` varchar(50) NOT NULL,
	`user_id` varchar(50) NOT NULL,
	`action` enum('view','copy','edit','delete','decrypt') NOT NULL,
	`ip_address` varchar(50) DEFAULT 'NULL',
	`user_agent` text DEFAULT 'NULL',
	`accessed_at` timestamp DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `community_voice_notes` (
	`id` varchar(50) NOT NULL,
	`post_id` varchar(50) DEFAULT 'NULL',
	`comment_id` varchar(50) DEFAULT 'NULL',
	`file_path` varchar(1000) NOT NULL,
	`duration` int(11) DEFAULT 'NULL',
	`file_size` bigint(20) DEFAULT 'NULL',
	`transcription` text DEFAULT 'NULL',
	`transcription_status` enum('pending','processing','completed','failed') DEFAULT '''pending''',
	`created_by` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` varchar(191) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`meeting_link` varchar(1000) NOT NULL,
	`meeting_type` varchar(32) NOT NULL DEFAULT '''zoom''',
	`start_time` datetime NOT NULL,
	`end_time` datetime NOT NULL,
	`timezone` varchar(100) NOT NULL DEFAULT '''UTC''',
	`status` varchar(16) NOT NULL DEFAULT '''scheduled''',
	`created_by_id` varchar(191) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL',
	`project_id` varchar(191) DEFAULT 'NULL',
	`reminder_minutes` int(11) DEFAULT 15,
	`agenda` text DEFAULT 'NULL',
	`notes` text DEFAULT 'NULL',
	`recording_url` varchar(1000) DEFAULT 'NULL',
	`is_recurring` tinyint(1) NOT NULL DEFAULT 0,
	`recurrence_pattern` varchar(50) DEFAULT 'NULL',
	`recurrence_end_date` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `meeting_attendees` (
	`id` varchar(191) NOT NULL,
	`meeting_id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`role` varchar(16) NOT NULL DEFAULT '''attendee''',
	`status` varchar(16) NOT NULL DEFAULT '''pending''',
	`response_at` datetime DEFAULT 'NULL',
	`added_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`notification_sent` tinyint(1) NOT NULL DEFAULT 0,
	`reminder_sent` tinyint(1) NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(191) NOT NULL,
	`type` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`read` tinyint(1) NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`user_id` varchar(191) NOT NULL,
	`related_id` varchar(191) DEFAULT 'NULL',
	`related_type` varchar(16) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `notifications_backup` (
	`id` varchar(191) NOT NULL,
	`type` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`read` tinyint(1) NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`user_id` varchar(191) NOT NULL,
	`related_id` varchar(191) DEFAULT 'NULL',
	`related_type` varchar(16) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`status` varchar(16) NOT NULL,
	`priority` varchar(8) NOT NULL,
	`start_date` datetime NOT NULL,
	`due_date` datetime NOT NULL,
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL',
	`completed_at` datetime DEFAULT 'NULL',
	`progress` int(11) NOT NULL,
	`owner_id` varchar(191) NOT NULL,
	`color` varchar(50) NOT NULL,
	`budget` decimal(10,2) DEFAULT 'NULL',
	`estimated_hours` decimal(10,2) DEFAULT 'NULL',
	`actual_hours` decimal(10,2) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `project_documents` (
	`id` varchar(191) NOT NULL,
	`project_id` varchar(191) NOT NULL,
	`name` varchar(500) NOT NULL,
	`size` int(11) NOT NULL,
	`type` varchar(100) NOT NULL,
	`url` varchar(1000) NOT NULL,
	`uploaded_by_id` varchar(191) NOT NULL,
	`uploaded_at` datetime NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `project_notes` (
	`id` varchar(191) NOT NULL,
	`project_id` varchar(191) NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`is_pinned` tinyint(1) NOT NULL DEFAULT 0,
	`created_by_id` varchar(191) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `project_tags` (
	`project_id` varchar(191) NOT NULL,
	`tag` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_team` (
	`project_id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `questionnaires` (
	`id` varchar(191) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text DEFAULT 'NULL',
	`instructions` text DEFAULT 'NULL',
	`created_by_id` varchar(191) NOT NULL,
	`target_type` varchar(50) NOT NULL,
	`target_role` varchar(50) DEFAULT 'NULL',
	`deadline` datetime NOT NULL,
	`is_mandatory` tinyint(1) DEFAULT 1,
	`allow_late_submission` tinyint(1) DEFAULT 0,
	`show_results_to_users` tinyint(1) DEFAULT 0,
	`status` varchar(50) DEFAULT '''draft''',
	`published_at` datetime DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `questionnaire_answers` (
	`id` varchar(191) NOT NULL,
	`response_id` varchar(191) NOT NULL,
	`question_id` varchar(191) NOT NULL,
	`answer_text` text DEFAULT 'NULL',
	`answer_value` varchar(500) DEFAULT 'NULL',
	`answer_number` decimal(10,2) DEFAULT 'NULL',
	`answer_file_url` varchar(1000) DEFAULT 'NULL',
	`answer_options` longtext DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `questionnaire_feedback` (
	`id` varchar(191) NOT NULL,
	`response_id` varchar(191) NOT NULL,
	`question_id` varchar(191) DEFAULT 'NULL',
	`from_user_id` varchar(191) NOT NULL,
	`message` text NOT NULL,
	`is_critical` tinyint(1) DEFAULT 0,
	`created_at` datetime DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `questionnaire_history` (
	`id` varchar(191) NOT NULL,
	`questionnaire_id` varchar(191) NOT NULL,
	`response_id` varchar(191) DEFAULT 'NULL',
	`user_id` varchar(191) NOT NULL,
	`action` varchar(100) NOT NULL,
	`notes` text DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `questionnaire_questions` (
	`id` varchar(191) NOT NULL,
	`questionnaire_id` varchar(191) NOT NULL,
	`question_text` text NOT NULL,
	`question_type` varchar(50) NOT NULL,
	`is_required` tinyint(1) DEFAULT 1,
	`options` longtext DEFAULT 'NULL',
	`min_value` int(11) DEFAULT 'NULL',
	`max_value` int(11) DEFAULT 'NULL',
	`max_file_size` int(11) DEFAULT 'NULL',
	`allowed_file_types` varchar(500) DEFAULT 'NULL',
	`placeholder_text` varchar(500) DEFAULT 'NULL',
	`help_text` text DEFAULT 'NULL',
	`display_order` int(11) NOT NULL,
	`created_at` datetime DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `questionnaire_responses` (
	`id` varchar(191) NOT NULL,
	`questionnaire_id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`status` varchar(50) DEFAULT '''pending''',
	`submitted_at` datetime DEFAULT 'NULL',
	`reviewed_at` datetime DEFAULT 'NULL',
	`reviewed_by_id` varchar(191) DEFAULT 'NULL',
	`admin_notes` text DEFAULT 'NULL',
	`is_late` tinyint(1) DEFAULT 0,
	`score` decimal(5,2) DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL',
	CONSTRAINT `unique_user_response` UNIQUE(`questionnaire_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE `questionnaire_targets` (
	`id` varchar(191) NOT NULL,
	`questionnaire_id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`is_notified` tinyint(1) DEFAULT 0,
	`notified_at` datetime DEFAULT 'NULL',
	`created_at` datetime DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `subtasks` (
	`id` varchar(191) NOT NULL,
	`task_id` varchar(191) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text DEFAULT 'NULL',
	`status` varchar(16) NOT NULL DEFAULT '''todo''',
	`completed` tinyint(1) NOT NULL DEFAULT 0,
	`start_date` datetime DEFAULT 'NULL',
	`due_date` datetime DEFAULT 'NULL',
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL',
	`assignee_id` varchar(191) DEFAULT 'NULL',
	`priority` varchar(8) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `subtask_assignees` (
	`subtask_id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subtask_tags` (
	`subtask_id` varchar(191) NOT NULL,
	`tag` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(191) NOT NULL,
	`project_id` varchar(191) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`status` varchar(16) NOT NULL,
	`priority` varchar(8) NOT NULL,
	`start_date` datetime NOT NULL,
	`due_date` datetime NOT NULL,
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL',
	`completed_at` datetime DEFAULT 'NULL',
	`created_by_id` varchar(191) NOT NULL,
	`approval_status` varchar(16) DEFAULT 'NULL',
	`approved_at` datetime DEFAULT 'NULL',
	`approved_by_id` varchar(191) DEFAULT 'NULL',
	`rejection_reason` text DEFAULT 'NULL',
	`progress` int(11) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_assignees` (
	`task_id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_tags` (
	`task_id` varchar(191) NOT NULL,
	`tag` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `timesheets` (
	`id` varchar(191) NOT NULL,
	`user_id` varchar(191) NOT NULL,
	`month` varchar(7) NOT NULL,
	`status` varchar(16) NOT NULL DEFAULT '''draft''',
	`submitted_at` datetime DEFAULT 'NULL',
	`approved_at` datetime DEFAULT 'NULL',
	`approved_by_id` varchar(191) DEFAULT 'NULL',
	`returned_at` datetime DEFAULT 'NULL',
	`return_comments` text DEFAULT 'NULL',
	`rejected_at` datetime DEFAULT 'NULL',
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` datetime DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `timesheet_entries` (
	`id` varchar(191) NOT NULL,
	`timesheet_id` varchar(191) NOT NULL,
	`date` varchar(10) NOT NULL,
	`hours` decimal(5,2) NOT NULL DEFAULT '0.00',
	`note` text DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(191) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`avatar` text DEFAULT 'NULL',
	`initials` varchar(10) NOT NULL,
	`role` varchar(16) NOT NULL,
	`status` varchar(16) DEFAULT 'NULL',
	`password_hash` text DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`user_id` varchar(191) NOT NULL,
	`email_notifications` tinyint(1) NOT NULL DEFAULT 1,
	`push_notifications` tinyint(1) NOT NULL DEFAULT 0,
	`task_reminders` tinyint(1) NOT NULL DEFAULT 1,
	`project_updates` tinyint(1) NOT NULL DEFAULT 1,
	`timezone` varchar(100) NOT NULL DEFAULT '''UTC''',
	`updated_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`meeting_reminders` tinyint(1) NOT NULL DEFAULT 1,
	`meeting_updates` tinyint(1) NOT NULL DEFAULT 1
);
--> statement-breakpoint
ALTER TABLE `attachments` ADD CONSTRAINT `attachments_uploaded_by_id_users_id_fk` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `project_tags` ADD CONSTRAINT `project_tags_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `project_team` ADD CONSTRAINT `project_team_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `project_team` ADD CONSTRAINT `project_team_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `subtasks` ADD CONSTRAINT `subtasks_assignee_id_users_id_fk` FOREIGN KEY (`assignee_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `subtasks` ADD CONSTRAINT `subtasks_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `subtask_tags` ADD CONSTRAINT `subtask_tags_subtask_id_subtasks_id_fk` FOREIGN KEY (`subtask_id`) REFERENCES `subtasks`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_approved_by_id_users_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `task_assignees` ADD CONSTRAINT `task_assignees_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `task_assignees` ADD CONSTRAINT `task_assignees_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `task_tags` ADD CONSTRAINT `task_tags_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `timesheets` ADD CONSTRAINT `timesheets_approved_by_id_users_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `timesheets` ADD CONSTRAINT `timesheets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `timesheet_entries` ADD CONSTRAINT `timesheet_entries_timesheet_id_timesheets_id_fk` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX `idx_comments_entity` ON `comments` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_created_by` ON `communities` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_visibility` ON `communities` (`visibility`);--> statement-breakpoint
CREATE INDEX `idx_archived` ON `communities` (`is_archived`);--> statement-breakpoint
CREATE INDEX `idx_created_at` ON `communities` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_community` ON `community_activity` (`community_id`);--> statement-breakpoint
CREATE INDEX `idx_user` ON `community_activity` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_action` ON `community_activity` (`action`);--> statement-breakpoint
CREATE INDEX `idx_target` ON `community_activity` (`target_type`,`target_id`);--> statement-breakpoint
CREATE INDEX `idx_created` ON `community_activity` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_activity_community_created` ON `community_activity` (`community_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_community` ON `community_categories` (`community_id`);--> statement-breakpoint
CREATE INDEX `idx_parent` ON `community_categories` (`parent_category_id`);--> statement-breakpoint
CREATE INDEX `idx_order` ON `community_categories` (`display_order`);--> statement-breakpoint
CREATE INDEX `idx_post` ON `community_comments` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_author` ON `community_comments` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_parent` ON `community_comments` (`parent_comment_id`);--> statement-breakpoint
CREATE INDEX `idx_created` ON `community_comments` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_comments_post_created` ON `community_comments` (`post_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_comments_post` ON `community_comments` (`post_id`,`is_deleted`);--> statement-breakpoint
CREATE INDEX `idx_comments_author` ON `community_comments` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_community` ON `community_files` (`community_id`);--> statement-breakpoint
CREATE INDEX `idx_post` ON `community_files` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_uploader` ON `community_files` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `idx_type` ON `community_files` (`file_type`);--> statement-breakpoint
CREATE INDEX `idx_uploaded` ON `community_files` (`uploaded_at`);--> statement-breakpoint
CREATE INDEX `idx_files_community_uploaded` ON `community_files` (`community_id`,`uploaded_at`);--> statement-breakpoint
CREATE INDEX `idx_files_community` ON `community_files` (`community_id`);--> statement-breakpoint
CREATE INDEX `idx_files_uploader` ON `community_files` (`uploaded_by`);--> statement-breakpoint
CREATE INDEX `idx_community` ON `community_members` (`community_id`);--> statement-breakpoint
CREATE INDEX `idx_user` ON `community_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_role` ON `community_members` (`role`);--> statement-breakpoint
CREATE INDEX `idx_joined` ON `community_members` (`joined_at`);--> statement-breakpoint
CREATE INDEX `idx_community` ON `community_posts` (`community_id`);--> statement-breakpoint
CREATE INDEX `idx_author` ON `community_posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_created` ON `community_posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_pinned` ON `community_posts` (`is_pinned`);--> statement-breakpoint
CREATE INDEX `idx_featured` ON `community_posts` (`is_featured`);--> statement-breakpoint
CREATE INDEX `idx_draft` ON `community_posts` (`is_draft`);--> statement-breakpoint
CREATE INDEX `idx_parent` ON `community_posts` (`parent_post_id`);--> statement-breakpoint
CREATE INDEX `idx_category` ON `community_posts` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_posts_community_created` ON `community_posts` (`community_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_posts_author_created` ON `community_posts` (`author_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_posts_community` ON `community_posts` (`community_id`,`is_deleted`,`is_draft`,`is_approved`);--> statement-breakpoint
CREATE INDEX `idx_posts_author` ON `community_posts` (`author_id`);--> statement-breakpoint
CREATE INDEX `idx_posts_pinned` ON `community_posts` (`is_pinned`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_post_reactions` ON `community_reactions` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_user_reactions` ON `community_reactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_reaction_type` ON `community_reactions` (`reaction_type`);--> statement-breakpoint
CREATE INDEX `idx_community` ON `community_vault` (`community_id`);--> statement-breakpoint
CREATE INDEX `idx_type` ON `community_vault` (`item_type`);--> statement-breakpoint
CREATE INDEX `idx_creator` ON `community_vault` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_expires` ON `community_vault` (`expires_at`);--> statement-breakpoint
CREATE INDEX `idx_created` ON `community_vault` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_vault_item` ON `community_vault_access_log` (`vault_item_id`);--> statement-breakpoint
CREATE INDEX `idx_user` ON `community_vault_access_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_accessed` ON `community_vault_access_log` (`accessed_at`);--> statement-breakpoint
CREATE INDEX `idx_action` ON `community_vault_access_log` (`action`);--> statement-breakpoint
CREATE INDEX `idx_post` ON `community_voice_notes` (`post_id`);--> statement-breakpoint
CREATE INDEX `idx_comment` ON `community_voice_notes` (`comment_id`);--> statement-breakpoint
CREATE INDEX `idx_creator` ON `community_voice_notes` (`created_by`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `community_voice_notes` (`transcription_status`);--> statement-breakpoint
CREATE INDEX `idx_meetings_start_time` ON `meetings` (`start_time`);--> statement-breakpoint
CREATE INDEX `idx_meetings_status` ON `meetings` (`status`);--> statement-breakpoint
CREATE INDEX `idx_meetings_created_by` ON `meetings` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `idx_meetings_project` ON `meetings` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_meeting_attendees_meeting` ON `meeting_attendees` (`meeting_id`);--> statement-breakpoint
CREATE INDEX `idx_meeting_attendees_user` ON `meeting_attendees` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_meeting_attendees_status` ON `meeting_attendees` (`status`);--> statement-breakpoint
CREATE INDEX `idx_notifications_user_id` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_notifications_user_read` ON `notifications` (`user_id`,`read`);--> statement-breakpoint
CREATE INDEX `idx_projects_owner_id` ON `projects` (`owner_id`);--> statement-breakpoint
CREATE INDEX `idx_project_documents_project_id` ON `project_documents` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_project_documents_uploaded_by` ON `project_documents` (`uploaded_by_id`);--> statement-breakpoint
CREATE INDEX `idx_project_documents_uploaded_at` ON `project_documents` (`uploaded_at`);--> statement-breakpoint
CREATE INDEX `idx_project_notes_project_id` ON `project_notes` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_project_notes_created_by` ON `project_notes` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `idx_project_notes_pinned` ON `project_notes` (`is_pinned`);--> statement-breakpoint
CREATE INDEX `idx_project_notes_created_at` ON `project_notes` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_project_team_project_id` ON `project_team` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_project_team_user_id` ON `project_team` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_questionnaires_created_by` ON `questionnaires` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `idx_questionnaires_status` ON `questionnaires` (`status`);--> statement-breakpoint
CREATE INDEX `idx_questionnaires_deadline` ON `questionnaires` (`deadline`);--> statement-breakpoint
CREATE INDEX `idx_answers_response` ON `questionnaire_answers` (`response_id`);--> statement-breakpoint
CREATE INDEX `idx_answers_question` ON `questionnaire_answers` (`question_id`);--> statement-breakpoint
CREATE INDEX `question_id` ON `questionnaire_feedback` (`question_id`);--> statement-breakpoint
CREATE INDEX `from_user_id` ON `questionnaire_feedback` (`from_user_id`);--> statement-breakpoint
CREATE INDEX `idx_feedback_response` ON `questionnaire_feedback` (`response_id`);--> statement-breakpoint
CREATE INDEX `idx_feedback_critical` ON `questionnaire_feedback` (`is_critical`);--> statement-breakpoint
CREATE INDEX `user_id` ON `questionnaire_history` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_history_questionnaire` ON `questionnaire_history` (`questionnaire_id`);--> statement-breakpoint
CREATE INDEX `idx_history_response` ON `questionnaire_history` (`response_id`);--> statement-breakpoint
CREATE INDEX `idx_questions_questionnaire` ON `questionnaire_questions` (`questionnaire_id`);--> statement-breakpoint
CREATE INDEX `idx_questions_order` ON `questionnaire_questions` (`display_order`);--> statement-breakpoint
CREATE INDEX `reviewed_by_id` ON `questionnaire_responses` (`reviewed_by_id`);--> statement-breakpoint
CREATE INDEX `idx_responses_questionnaire` ON `questionnaire_responses` (`questionnaire_id`);--> statement-breakpoint
CREATE INDEX `idx_responses_user` ON `questionnaire_responses` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_responses_status` ON `questionnaire_responses` (`status`);--> statement-breakpoint
CREATE INDEX `idx_targets_questionnaire` ON `questionnaire_targets` (`questionnaire_id`);--> statement-breakpoint
CREATE INDEX `idx_targets_user` ON `questionnaire_targets` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_subtasks_task_id` ON `subtasks` (`task_id`);--> statement-breakpoint
CREATE INDEX `idx_subtask_assignees_subtask` ON `subtask_assignees` (`subtask_id`);--> statement-breakpoint
CREATE INDEX `idx_subtask_assignees_user` ON `subtask_assignees` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_project_id` ON `tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_created_by` ON `tasks` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `idx_tasks_approval_status` ON `tasks` (`approval_status`);--> statement-breakpoint
CREATE INDEX `idx_task_assignees_user_id` ON `task_assignees` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_task_assignees_task_id` ON `task_assignees` (`task_id`);
*/