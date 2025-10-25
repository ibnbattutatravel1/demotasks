-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 25, 2025 at 02:57 AM
-- Server version: 8.0.43-0ubuntu0.24.04.2
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `taskara_old`
--

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `entity_type`, `entity_id`, `user_id`, `user_name`, `avatar`, `content`, `created_at`, `updated_at`) VALUES
('10cb0bc8-4e95-492a-ba74-e9747768998e', 'subtask', 'subtask-1759286170249', 'system-deleted-user', 'Deleted User', NULL, 'CD', '2025-10-01 02:36:24', '2025-10-01 02:36:24'),
('2f6fcf3d-4324-4f0c-a565-1cd806380224', 'subtask', 'acc98e10-d620-4ee4-b79d-9895768b57e4', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f', 'Abdelrahman Hesham', NULL, 'https://docs.together.ai/docs/fine-tuning-models', '2025-10-05 21:51:45', '2025-10-05 21:51:45'),
('576b207f-2e87-4f31-9cc9-f5d181d600b6', 'task', '3a02bd79-01db-476f-a1f8-e026d80a7ebc', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'Aya Fouda', NULL, 'Waiting for Dr. Radwa\'s review', '2025-10-15 13:27:02', '2025-10-15 13:27:02'),
('9900f086-1f8b-4f3f-bbe3-a897184414bf', 'subtask', '145672e6-7e6b-4174-9d0c-9cd8d5d82902', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', 'Mohamed Essawey', NULL, 'https://nileuniversity-my.sharepoint.com/:w:/g/personal/m_abdelmaged_nu_edu_eg/EUpX-jIzAmNCjkSHY1tsjaoBH4gPn5hHvg3y-tpfylkxCg?e=0UPnn9', '2025-10-15 07:57:06', '2025-10-15 07:57:06'),
('bfc53dc2-2f63-40da-ba82-54e328618fcc', 'subtask', '6116f628-6776-45f4-a0c8-fd0858d7ef43', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f', 'Abdelrahman Hesham', NULL, 'https://docs.google.com/document/d/1rcYChqley9c79D8MrHkw5KQuBNzUM7ZtLaTxI3tyZj0/edit?usp=sharing', '2025-10-06 11:50:48', '2025-10-06 11:50:48'),
('ea2b2483-bb36-44a7-95f9-54b872e005ae', 'subtask', '145672e6-7e6b-4174-9d0c-9cd8d5d82902', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', 'Mohamed Essawey', NULL, '(MERGED) https://docs.google.com/document/d/1B2cqmfg8d8yBhT_3dtY6j27gLXtRqH6m/edit?usp=sharing&ouid=102271907480414275565&rtpof=true&sd=true', '2025-10-24 08:35:55', '2025-10-24 08:35:55'),
('ebbf3fb9-9d86-43b4-a18e-a4a6568bb934', 'task', 'ccf90c1b-d412-44c0-87ea-fd9d5784b862', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'Aya Fouda', NULL, 'Waiting for Dr. Radwa\'s review', '2025-10-15 13:26:54', '2025-10-15 13:26:54'),
('ed55342d-3dbe-4f9f-8c0a-983b074dcbb2', 'task', '3a02bd79-01db-476f-a1f8-e026d80a7ebc', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'Aya Fouda', NULL, 'link : https://www.notion.so/Mental-status-examination-28afb530162d806ab8b4d42bcf85f90e', '2025-10-14 09:00:46', '2025-10-14 09:00:46');

-- --------------------------------------------------------

--
-- Table structure for table `communities`
--

CREATE TABLE `communities` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '#6366f1',
  `visibility` enum('public','private','secret') COLLATE utf8mb4_unicode_ci DEFAULT 'private',
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_archived` tinyint(1) DEFAULT '0',
  `archived_at` timestamp NULL DEFAULT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `members_count` int DEFAULT '0',
  `posts_count` int DEFAULT '0'
) ;

-- --------------------------------------------------------

--
-- Table structure for table `community_activity`
--

CREATE TABLE `community_activity` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` enum('created','updated','deleted','commented','reacted','joined','left','shared','mentioned','pinned','archived') COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` enum('post','comment','file','vault_item','member','community','category') COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `community_categories`
--

CREATE TABLE `community_categories` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_category_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_comments`
--

CREATE TABLE `community_comments` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `author_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_comment_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `edited_at` timestamp NULL DEFAULT NULL,
  `reactions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `mentioned_users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `is_deleted` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) NOT NULL DEFAULT '1'
) ;

-- --------------------------------------------------------

--
-- Table structure for table `community_files`
--

CREATE TABLE `community_files` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_by` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `downloads_count` int DEFAULT '0',
  `is_public` tinyint(1) DEFAULT '0',
  `thumbnail_path` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `community_members`
--

CREATE TABLE `community_members` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('owner','admin','moderator','editor','contributor','viewer') COLLATE utf8mb4_unicode_ci DEFAULT 'viewer',
  `custom_permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_active_at` timestamp NULL DEFAULT NULL,
  `is_muted` tinyint(1) DEFAULT '0'
) ;

-- --------------------------------------------------------

--
-- Table structure for table `community_posts`
--

CREATE TABLE `community_posts` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `content_type` enum('markdown','rich_text','plain_text') COLLATE utf8mb4_unicode_ci DEFAULT 'markdown',
  `author_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `edited_at` timestamp NULL DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT '0',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_draft` tinyint(1) DEFAULT '0',
  `is_approved` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) DEFAULT '0',
  `views_count` int DEFAULT '0',
  `reactions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `mentioned_users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `parent_post_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `community_reactions`
--

CREATE TABLE `community_reactions` (
  `id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reaction_type` enum('like','love','celebrate','support','insightful','curious') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'like',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_stats`
--

CREATE TABLE `community_stats` (
  `id` varchar(50) DEFAULT NULL,
  `members_count` int DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `posts_count` int DEFAULT NULL,
  `total_comments` bigint DEFAULT NULL,
  `total_files` bigint DEFAULT NULL,
  `total_posts` bigint DEFAULT NULL,
  `total_views` decimal(32,0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_vault`
--

CREATE TABLE `community_vault` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `community_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_type` enum('api_key','password','secret','certificate','token','credentials','other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `encrypted_content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `encryption_iv` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `encryption_tag` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `access_count` int DEFAULT '0',
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `last_accessed_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allowed_roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `allowed_users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ;

-- --------------------------------------------------------

--
-- Table structure for table `community_vault_access_log`
--

CREATE TABLE `community_vault_access_log` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vault_item_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` enum('view','copy','edit','delete','decrypt') COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `accessed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_voice_notes`
--

CREATE TABLE `community_voice_notes` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `post_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` int DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `transcription` text COLLATE utf8mb4_unicode_ci,
  `transcription_status` enum('pending','processing','completed','failed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `meeting_link` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meeting_type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'zoom',
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `timezone` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UTC',
  `status` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'scheduled',
  `created_by_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `project_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reminder_minutes` int DEFAULT '15',
  `agenda` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `recording_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT '0',
  `recurrence_pattern` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recurrence_end_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meeting_attendees`
--

CREATE TABLE `meeting_attendees` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meeting_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'attendee',
  `status` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `response_at` datetime DEFAULT NULL,
  `added_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notification_sent` tinyint(1) NOT NULL DEFAULT '0',
  `reminder_sent` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `read`, `created_at`, `user_id`, `related_id`, `related_type`) VALUES
('02388049-d48e-4706-ab7e-db1ba6e21386', 'admin_task_approved', 'Wisal Story Development', 'Task \"Wisal Story Development\" has been approved.', 1, '2025-10-02 12:44:47', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'e0eb2117-4dda-4d78-9be3-890a586fdd97', 'task'),
('03d6f5bf-cd02-43b7-b2a0-54c9035e0e77', 'task_pending_review', 'Summarized the patient’s history', 'Summarized the patient’s history is awaiting approval.', 1, '2025-10-15 13:29:45', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'abf66e55-efff-4880-8e3d-699c42124797', 'task'),
('05bca0bc-8f97-40d7-8fd9-e85f3bc2f086', 'task_approved', 'Screening and patient history integration', 'Your task has been approved.', 1, '2025-10-02 00:20:20', 'e67174ed-e76f-412e-aebf-2e35b71add80', '3497a748-6236-49a4-ba4a-3c1499893cc2', 'task'),
('0608ab28-f1ea-44bd-befc-89fc920b9d6e', 'admin_task_approved', 'Summarized the patient’s history', 'Task \"Summarized the patient’s history\" has been approved.', 1, '2025-10-15 13:57:58', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'abf66e55-efff-4880-8e3d-699c42124797', 'task'),
('0aecbc6a-e2e5-4d3e-9fec-bb6bf6a0ee1e', 'task_approved', 'Follow up Questions', 'Your task has been approved.', 1, '2025-10-15 13:57:57', 'b424841b-b72d-4d4d-a703-30565b3e7406', '9949bba5-caed-41ba-aacd-ae615a9f989a', 'task'),
('0b76f0b0-b3ef-42f5-920c-7971f2e8931d', 'task_assigned', 'Weaviate account', 'You were assigned to a task.', 0, '2025-10-19 10:37:05', 'e9f05589-b1ef-43d7-a786-980d3781a9db', 'dc4c96c6-e0f3-4a68-933a-ebd50ac898b0', 'task'),
('0bfc0052-cdc6-4d9b-ace7-95a8530ed56f', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', 'system-deleted-user', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('0f0ca4ea-3ad5-439d-a1c5-ffd6afeb2504', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 0, '2025-10-13 11:29:24', '06de0cce-5c75-4f7a-b7ba-bb0d51557182', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('1062b157-f659-41bb-b7ff-728b8b902b44', 'task_pending', 'Judging The Judge ', 'Your task is pending approval.', 1, '2025-10-14 10:54:11', 'ba437a54-de69-4b64-ac4a-883b84f26f36', '15dd34e9-b4ca-450d-abc0-59281663bcd4', 'task'),
('11629667-c69b-4a2e-9e48-d19089200295', 'task_commented', 'Wisal Image features upgrade', 'Abdelrahman Hesham commented on a subtask.', 1, '2025-10-06 11:50:47', 'e67174ed-e76f-412e-aebf-2e35b71add80', '1689958c-76ed-45ff-89f8-d7787ddf2238', 'task'),
('1266ca38-5d27-4d5e-9a20-38964571f565', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:53', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('1284d07d-ef34-44c9-9787-0ff3d6a8c8ff', 'task_approved', 'Risk Assessment  (Suicide Ideation)', 'Your task has been approved.', 1, '2025-10-13 10:22:56', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'b4c79395-fbd4-4ce6-a347-edc9f6134441', 'task'),
('14889882-d98d-4b45-85dc-20b466b9f3e3', 'task_pending_review', 'Judging The Judge ', 'Judging The Judge  is awaiting approval.', 1, '2025-10-14 10:54:12', 'e67174ed-e76f-412e-aebf-2e35b71add80', '15dd34e9-b4ca-450d-abc0-59281663bcd4', 'task'),
('1649d5fc-3aa0-47c5-b1f5-8bf502b216a4', 'task_commented', 'Physical Examination', 'Aya Fouda commented on a task.', 1, '2025-10-15 13:26:53', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'ccf90c1b-d412-44c0-87ea-fd9d5784b862', 'task'),
('16c1e760-4343-4690-946a-d4a3d827e9eb', 'task_rejected', 'test', 'Your task has been rejected.', 1, '2025-10-01 15:44:34', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('18482cfd-caca-43f9-8bd4-aa6fbfb5f048', 'task_approved', 'Scene Graph prompting ', 'Your task has been approved.', 1, '2025-10-21 20:24:02', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', '6cc2fe35-ea1f-4fa6-bd81-6c10513de0bb', 'task'),
('18ce88c5-6313-4d21-a3e5-30f53513c886', 'task_pending_review', 'Mental State Examination', 'Mental State Examination is awaiting approval.', 1, '2025-10-13 08:08:27', 'e67174ed-e76f-412e-aebf-2e35b71add80', '3a02bd79-01db-476f-a1f8-e026d80a7ebc', 'task'),
('19b21489-db1f-436b-9a5d-3e929b9b94d0', 'task_commented', 'Fine Tuning tool using APIs', 'Abdelrahman Hesham commented on a subtask.', 1, '2025-10-05 21:51:45', 'e67174ed-e76f-412e-aebf-2e35b71add80', '36806bac-a84b-4916-9063-ba040f76caf5', 'task'),
('1add7b73-1202-480b-828b-d29f3b562a7f', 'timesheet_submitted', 'Timesheet submitted', 'A timesheet for 2025-10 has been submitted', 1, '2025-10-01 15:13:09', 'system-deleted-user', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('1c8b7545-463a-46d1-b6a4-1f104d0112a5', 'task_approved', 'Judging The Judge ', 'Your task has been approved.', 1, '2025-10-14 13:32:21', 'ba437a54-de69-4b64-ac4a-883b84f26f36', '15dd34e9-b4ca-450d-abc0-59281663bcd4', 'task'),
('1f38f07f-cb1a-4df9-b596-31f0271bd52e', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', 'system-deleted-user', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('2498f928-8125-45ab-83b3-44854c698ea8', 'task_pending_review', 'Modify reviewer comments on the psychiatry test paper', 'Modify reviewer comments on the psychiatry test paper is awaiting approval.', 1, '2025-10-20 03:33:04', 'e67174ed-e76f-412e-aebf-2e35b71add80', '7b831c8d-d5bc-413c-9379-e83a69983041', 'task'),
('259302c0-c536-4dc1-8898-c115cfc34782', 'task_commented', 'Mental State Examination', 'Aya Fouda commented on a task.', 1, '2025-10-15 13:27:02', 'e67174ed-e76f-412e-aebf-2e35b71add80', '3a02bd79-01db-476f-a1f8-e026d80a7ebc', 'task'),
('264aa73e-b9d8-4d23-b335-3f72078c37b6', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 0, '2025-10-01 23:08:36', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('2ab03604-ea3f-4943-9c7c-14a356698ad1', 'project_updated', 'Project updated: test project - 2 (Copy) (Copy)', 'Project details have been updated.', 0, '2025-10-01 18:58:19', 'system-deleted-user', '9db2490a-2c49-4a75-8f0b-4b994fc79c63', 'project'),
('2bf4a249-5c04-49cf-acba-72f843480e89', 'project_updated', 'Project updated: LLM Safety and Security', 'Project details have been updated.', 1, '2025-10-01 23:49:04', 'e67174ed-e76f-412e-aebf-2e35b71add80', '2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'project'),
('2cb5393f-4281-4b29-8375-29b818fd4d5e', 'task_commented', 'FREFRE', 'Admin User commented on a task.', 0, '2025-10-01 02:45:22', 'system-deleted-user', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'task'),
('2e2c407b-36f0-41bb-88cd-e758b6d8b830', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 0, '2025-10-13 11:29:24', 'b424841b-b72d-4d4d-a703-30565b3e7406', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('3640b944-c65b-4aea-879e-b9bd58be2c7b', 'project_updated', 'Project updated: PsychiatrAi', 'Project details have been updated.', 1, '2025-10-01 23:59:41', 'e67174ed-e76f-412e-aebf-2e35b71add80', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'project'),
('36a5a9a1-7695-4a8d-8edf-249791b9599b', 'task_approved', 'Check Facts and Check Hallucination', 'Your task has been approved.', 1, '2025-10-13 10:23:04', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'd1feefe1-c052-40df-9f76-155c26466bc7', 'task'),
('36b90bf7-8018-4448-b1d7-2d19679e6da3', 'task_approved', 'Allam2  safety Benchmarking', 'Your task has been approved.', 1, '2025-10-05 10:29:27', 'e67174ed-e76f-412e-aebf-2e35b71add80', '0261f8aa-304c-4bdf-a749-7b751b0803e1', 'task'),
('42226b62-b8ce-433d-a52c-ad0174b9e47c', 'project_updated', 'Project updated: Stocks/Trading Predication ', 'Project details have been updated.', 1, '2025-10-02 00:31:16', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'b9fd6e5e-65b7-4692-a306-dd7a32a6b8dc', 'project'),
('4278f065-67d0-4b91-b44a-1603a3511315', 'task_approved', 'Wisal Image features/bug list', 'Your task has been approved.', 1, '2025-10-13 11:29:05', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'e634ef04-190c-4609-87a3-0f60bf795232', 'task'),
('42e11a5e-4987-451f-a208-215f6433ae84', 'task_approved', 'FREFRE', 'Your task has been approved.', 1, '2025-10-01 02:43:43', 'system-deleted-user', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'task'),
('43413dc6-855c-4b2b-bbd5-ce4c5564bc7d', 'task_approved', 'Wisal Image features upgrade', 'Your task has been approved.', 1, '2025-10-04 17:56:26', 'e67174ed-e76f-412e-aebf-2e35b71add80', '1689958c-76ed-45ff-89f8-d7787ddf2238', 'task'),
('4458a48c-7545-454d-bf75-a70cf9beacde', 'task_approved', 'Finalize and optimize the Wisal QA pipeline', 'Your task has been approved.', 1, '2025-10-06 16:09:01', 'b424841b-b72d-4d4d-a703-30565b3e7406', '811c948f-cf23-4117-8133-bb9537a0e78f', 'task'),
('460a757a-287a-4e7a-937d-a891b61af8fc', 'task_approved', 'TEST TASK -- 2', 'Your task has been approved.', 1, '2025-10-01 02:22:16', 'system-deleted-user', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('493904c0-f38d-4a4d-b4e4-3fa29ffa9553', 'task_commented', 'Wisal Image features/bug list', 'Mohamed Essawey commented on a subtask.', 1, '2025-10-15 07:57:05', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'e634ef04-190c-4609-87a3-0f60bf795232', 'task'),
('49d9e2be-3079-47a7-ba9a-60b5d180ecaf', 'task_pending', 'complete comments in the documentation/report', 'Your task is pending approval.', 1, '2025-10-07 17:27:30', 'ba437a54-de69-4b64-ac4a-883b84f26f36', '267db3d0-041b-4fbf-add5-c5963b949a24', 'task'),
('4a43f9d3-414a-4506-a764-8fa0efb59d35', 'task_approved', 'Wisal Story Development', 'Your task has been approved.', 1, '2025-10-02 12:44:47', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b', 'e0eb2117-4dda-4d78-9be3-890a586fdd97', 'task'),
('4c7deb61-58a4-404b-8044-5491bf147058', 'admin_task_approved', 'complete comments in the documentation/report', 'Task \"complete comments in the documentation/report\" has been approved.', 1, '2025-10-07 18:12:10', 'e67174ed-e76f-412e-aebf-2e35b71add80', '267db3d0-041b-4fbf-add5-c5963b949a24', 'task'),
('4d5786af-370d-4a55-b8c6-ca04a6da3478', 'task_approved', 'complete comments in the documentation/report', 'Your task has been approved.', 1, '2025-10-07 18:12:10', 'ba437a54-de69-4b64-ac4a-883b84f26f36', '267db3d0-041b-4fbf-add5-c5963b949a24', 'task'),
('501f4626-f067-4e7f-b815-57c84af2b3c9', 'task_pending', 'Modify reviewer comments on the psychiatry test paper', 'Your task is pending approval.', 1, '2025-10-20 03:33:03', 'b424841b-b72d-4d4d-a703-30565b3e7406', '7b831c8d-d5bc-413c-9379-e83a69983041', 'task'),
('56cdd52f-22e9-4d2f-bade-97fa293899ff', 'project_updated', 'Project updated: PsychiatrAi', 'Project details have been updated.', 1, '2025-10-01 23:59:41', 'b424841b-b72d-4d4d-a703-30565b3e7406', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'project'),
('59648895-f089-4d32-a29f-c636bbcfe5fa', 'task_approved', 'gtrrt', 'Your task has been approved.', 1, '2025-10-01 18:52:20', 'system-deleted-user', 'eed8c3da-1b43-46be-8e69-4771b9268787', 'task'),
('598b256f-7859-4300-aa22-c9923dcaa69a', 'task_pending', 'Check Facts and Check Hallucination', 'Your task is pending approval.', 1, '2025-10-13 08:13:28', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'd1feefe1-c052-40df-9f76-155c26466bc7', 'task'),
('5ace18e3-4474-4727-89e9-3addba2c7325', 'task_pending_review', 'read this paper https://arxiv.org/pdf/2404.00906', 'read this paper https://arxiv.org/pdf/2404.00906 is awaiting approval.', 1, '2025-10-22 11:20:02', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'cf8444b9-bc83-49ac-b8b4-7ddd8deafa75', 'task'),
('5cb245d2-0a24-4bf6-8769-9518c4b5d63c', 'task_approved', 'Survey models and techniques', 'Your task has been approved.', 1, '2025-10-02 00:30:55', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'c94e6b45-e77e-4ffc-a6b1-82c9f3cb51b0', 'task'),
('5e7d8cb8-e81d-46e7-a8d8-1060f2f67dd4', 'task_pending', 'Mental State Examination', 'Your task is pending approval.', 1, '2025-10-13 08:08:25', 'b424841b-b72d-4d4d-a703-30565b3e7406', '3a02bd79-01db-476f-a1f8-e026d80a7ebc', 'task'),
('5f160e90-791e-43c6-80b9-fbe8c483c825', 'admin_task_approved', 'Mental State Examination', 'Task \"Mental State Examination\" has been approved.', 1, '2025-10-13 10:22:55', 'e67174ed-e76f-412e-aebf-2e35b71add80', '3a02bd79-01db-476f-a1f8-e026d80a7ebc', 'task'),
('5f63d73b-b14f-4468-9211-edf06b3b9a79', 'admin_task_approved', 'Risk Assessment  (Suicide Ideation)', 'Task \"Risk Assessment  (Suicide Ideation)\" has been approved.', 1, '2025-10-13 10:22:56', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'b4c79395-fbd4-4ce6-a347-edc9f6134441', 'task'),
('5fae9e1d-b70f-41ee-b1d9-bdda0ca0bbb2', 'task_pending', 'Follow up Questions', 'Your task is pending approval.', 1, '2025-10-15 13:31:45', 'b424841b-b72d-4d4d-a703-30565b3e7406', '9949bba5-caed-41ba-aacd-ae615a9f989a', 'task'),
('64dc3d5a-6e59-406d-96d1-ace6a2016bad', 'task_pending', 'Risk Assessment  (Suicide Ideation)', 'Your task is pending approval.', 1, '2025-10-13 08:11:25', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'b4c79395-fbd4-4ce6-a347-edc9f6134441', 'task'),
('6521bf1e-5c79-4d62-ae6f-2330b634e68f', 'admin_task_approved', 'Scene Graph prompting ', 'Task \"Scene Graph prompting \" has been approved.', 1, '2025-10-21 20:24:02', 'e67174ed-e76f-412e-aebf-2e35b71add80', '6cc2fe35-ea1f-4fa6-bd81-6c10513de0bb', 'task'),
('69a07ec6-54f3-41da-a276-ae8700ffaa76', 'task_approved', 'Modify reviewer comments on the psychiatry test paper', 'Your task has been approved.', 1, '2025-10-21 20:24:05', 'b424841b-b72d-4d4d-a703-30565b3e7406', '7b831c8d-d5bc-413c-9379-e83a69983041', 'task'),
('6b8f7714-a37a-4387-a59f-cca67cb6457f', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 0, '2025-10-01 02:29:59', 'system-deleted-user', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('6f06f4d8-9931-4976-bbdf-4b9c233b3b10', 'task_approved', 'test kan', 'Your task has been approved.', 1, '2025-10-01 19:36:54', 'e67174ed-e76f-412e-aebf-2e35b71add80', '3499f72c-ed0a-4de2-be71-fc925a564f76', 'task'),
('7051fdbc-1722-4572-be09-301b88daf514', 'task_pending_review', 'Finalize and optimize the Wisal QA pipeline', 'Finalize and optimize the Wisal QA pipeline is awaiting approval.', 1, '2025-10-06 14:38:38', 'e67174ed-e76f-412e-aebf-2e35b71add80', '811c948f-cf23-4117-8133-bb9537a0e78f', 'task'),
('70a323a1-cfea-4082-9ed0-0039f92018fd', 'project_updated', 'Project updated: test project - 1', 'Project details have been updated.', 1, '2025-10-01 02:19:11', 'system-deleted-user', '75841349-2407-498c-a049-7b87720f5853', 'project'),
('727e1bcd-897f-48dd-9c1a-ae080b47ba12', 'task_pending', 'Scene Graph prompting ', 'Your task is pending approval.', 1, '2025-10-21 08:40:47', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', '6cc2fe35-ea1f-4fa6-bd81-6c10513de0bb', 'task'),
('74149809-4874-4709-a6a2-bb3bb84b4b57', 'admin_task_approved', 'Treatment', 'Task \"Treatment\" has been approved.', 1, '2025-10-13 10:23:00', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'b53aa0bc-ad0c-408a-8970-366898268e2f', 'task'),
('74636093-189f-4f96-ba8c-b86d40a536d6', 'task_approved', 'Physical Examination', 'Your task has been approved.', 1, '2025-10-13 10:23:01', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'ccf90c1b-d412-44c0-87ea-fd9d5784b862', 'task'),
('74d9db17-ba8d-4094-b4ec-60a428c06b23', 'task_pending_review', 'Scene Graph prompting ', 'Scene Graph prompting  is awaiting approval.', 1, '2025-10-21 08:40:49', 'e67174ed-e76f-412e-aebf-2e35b71add80', '6cc2fe35-ea1f-4fa6-bd81-6c10513de0bb', 'task'),
('75e4f109-0ed9-41b4-9886-63d15e9c8a38', 'project_updated', 'Project updated: PsychiatrAi', 'Project details have been updated.', 1, '2025-10-02 00:00:33', 'b424841b-b72d-4d4d-a703-30565b3e7406', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'project'),
('7668f456-3299-4f8d-8b16-29d9fab7de17', 'admin_task_rejected', 'test', 'Task \"test\" has been rejected.', 1, '2025-10-01 15:44:35', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('76e478e5-5c54-4dc0-855d-b24964fde9e7', 'task_pending_review', 'Add ab😀', 'Add ab😀 is awaiting approval.', 1, '2025-10-24 08:42:04', 'e67174ed-e76f-412e-aebf-2e35b71add80', '59879f12-8254-4e03-93dc-d1e728a08c89', 'task'),
('7e1ecda6-9475-4a6b-9dd5-97cedbae2ac1', 'task_pending', 'task - 4 (Copy)', 'Your task is pending approval.', 1, '2025-10-01 18:57:41', 'system-deleted-user', 'a1eb4575-3e91-4e33-ae54-e211538f5e35', 'task'),
('80710ecc-52aa-460d-87d9-caeddaaba71c', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', 'system-deleted-user', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('80ddb817-029d-4096-aa4e-a8d6cac44b66', 'task_approved', 'read this paper https://arxiv.org/pdf/2404.00906', 'Your task has been approved.', 1, '2025-10-22 16:33:02', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', 'cf8444b9-bc83-49ac-b8b4-7ddd8deafa75', 'task'),
('8129c5a2-a3b8-4c09-b52d-56115bbcb157', 'task_pending', 'Finalize and optimize the Wisal QA pipeline', 'Your task is pending approval.', 1, '2025-10-06 14:38:37', 'b424841b-b72d-4d4d-a703-30565b3e7406', '811c948f-cf23-4117-8133-bb9537a0e78f', 'task'),
('835c8e4c-cd6b-44a4-9b74-fcc744289481', 'project_updated', 'Project updated: test project - 1', 'Project details have been updated.', 0, '2025-10-01 02:19:11', 'system-deleted-user', '75841349-2407-498c-a049-7b87720f5853', 'project'),
('8a3fd368-7ee2-4daa-9f89-7b55b1d3f67b', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 0, '2025-10-13 11:29:24', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('8baf32c7-562c-4bd8-9750-2b486a4a4721', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', 'system-deleted-user', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('8ce95b9b-4c93-4f76-a66e-fc53a2292a8d', 'task_approved', 'Fine Tuning tool using APIs', 'Your task has been approved.', 1, '2025-10-05 10:51:26', 'e67174ed-e76f-412e-aebf-2e35b71add80', '36806bac-a84b-4916-9063-ba040f76caf5', 'task'),
('8cf3a689-7b54-4a72-9f08-d03afe403fa0', 'task_pending_review', 'Physical Examination', 'Physical Examination is awaiting approval.', 1, '2025-10-13 08:12:13', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'ccf90c1b-d412-44c0-87ea-fd9d5784b862', 'task'),
('8db48a8d-625a-4794-be8e-108fbd940669', 'task_pending', 'read this paper https://arxiv.org/pdf/2404.00906', 'Your task is pending approval.', 1, '2025-10-22 11:20:00', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', 'cf8444b9-bc83-49ac-b8b4-7ddd8deafa75', 'task'),
('902a3886-e306-42ab-b221-eea858bd4a3e', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 0, '2025-10-01 23:08:36', '06de0cce-5c75-4f7a-b7ba-bb0d51557182', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('90b6c84f-bf2b-45f8-b277-2f8544294ee2', 'task_pending', 'Add ab😀', 'Your task is pending approval.', 0, '2025-10-24 08:42:03', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', '59879f12-8254-4e03-93dc-d1e728a08c89', 'task'),
('91b02ecf-451b-4a36-b1db-ff0e7dd62014', 'project_updated', 'Project updated: test project - 2 (Copy) (Copy)', 'Project details have been updated.', 0, '2025-10-01 18:58:19', 'system-deleted-user', '9db2490a-2c49-4a75-8f0b-4b994fc79c63', 'project'),
('924171c0-cb13-4f62-9b45-8c7671b222da', 'task_approved', 'Add a \"😀\"', 'Your task has been approved.', 0, '2025-10-24 13:00:02', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', '59879f12-8254-4e03-93dc-d1e728a08c89', 'task'),
('9445f46e-ac3f-4c10-bbfa-511829c8da89', 'admin_task_approved', 'Physical Examination', 'Task \"Physical Examination\" has been approved.', 1, '2025-10-13 10:23:01', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'ccf90c1b-d412-44c0-87ea-fd9d5784b862', 'task'),
('9a39f009-f0d0-485f-89bf-b45dde2a2dba', 'task_pending_review', 'Follow up Questions', 'Follow up Questions is awaiting approval.', 1, '2025-10-15 13:31:46', 'e67174ed-e76f-412e-aebf-2e35b71add80', '9949bba5-caed-41ba-aacd-ae615a9f989a', 'task'),
('9b8510ae-e819-42b8-94ba-0d94d7f0c8bd', 'admin_task_approved', 'read this paper https://arxiv.org/pdf/2404.00906', 'Task \"read this paper https://arxiv.org/pdf/2404.00906\" has been approved.', 1, '2025-10-22 16:33:02', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'cf8444b9-bc83-49ac-b8b4-7ddd8deafa75', 'task'),
('9be6f991-b0e3-4f00-84bd-8a27562ed3b3', 'task_pending', 'test', 'Your task is pending approval.', 1, '2025-10-01 15:00:03', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('9e8eb0c4-48dc-4b90-b121-4d09dbf7e26c', 'task_approved', 'task - 4', 'Your task has been approved.', 1, '2025-10-01 02:20:20', 'system-deleted-user', 'f1b34881-eda9-4231-a34a-40efa5322ab6', 'task'),
('a02dc6ad-a398-4e7c-867b-7a0211852da8', 'task_approved', 'Treatment', 'Your task has been approved.', 1, '2025-10-13 10:23:00', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'b53aa0bc-ad0c-408a-8970-366898268e2f', 'task'),
('a1f67e54-b644-43c6-bd0e-c834be8c3ee8', 'timesheet_approved', 'Timesheet approved', 'Your 2025-10 timesheet was approved', 1, '2025-10-01 15:13:41', 'system-deleted-user', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('a2dca259-907d-4297-a991-19b7559ade3b', 'timesheet_returned', 'Timesheet returned', 'Your 2025-10 timesheet was returned: ttt', 1, '2025-10-01 15:12:26', 'system-deleted-user', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('ab977db5-e15c-410f-9f67-b157fc6fbb25', 'task_approved', 'Wisal QA live', 'Your task has been approved.', 1, '2025-10-01 23:06:32', 'e67174ed-e76f-412e-aebf-2e35b71add80', '5ce2de89-0d5f-4ab1-bb68-70ec63b1500e', 'task'),
('ad731d45-cdf9-4a04-9b64-08256c9224a4', 'task_assigned', 'Wisal Image features/bug list', 'You were assigned to a task.', 1, '2025-10-13 11:29:54', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', 'e634ef04-190c-4609-87a3-0f60bf795232', 'task'),
('b15b6d36-b83e-40da-ad38-0158da11d9bd', 'task_pending_review', 'complete comments in the documentation/report', 'complete comments in the documentation/report is awaiting approval.', 1, '2025-10-07 17:27:32', 'e67174ed-e76f-412e-aebf-2e35b71add80', '267db3d0-041b-4fbf-add5-c5963b949a24', 'task'),
('b23a8f1a-814d-4248-99b0-c48165cecfad', 'task_pending', 'Summarized the patient’s history', 'Your task is pending approval.', 1, '2025-10-15 13:29:44', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'abf66e55-efff-4880-8e3d-699c42124797', 'task'),
('b26215bf-583c-47fa-8bae-9d71e51b6ec3', 'task_approved', 'Summarized the patient’s history', 'Your task has been approved.', 1, '2025-10-15 13:57:58', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'abf66e55-efff-4880-8e3d-699c42124797', 'task'),
('b324ec58-61f0-49cc-b2d6-0a551152a9c2', 'task_approved', 'test task', 'Your task has been approved.', 1, '2025-10-01 19:33:34', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'bc9ad58d-4cad-4a1b-9b25-ab1cf95b5d4f', 'task'),
('b325e322-4878-4101-a50f-38172261e07d', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 0, '2025-10-13 11:29:24', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('b5b58b41-f751-4457-9d84-0777cca396d9', 'task_approved', 'Mental State Examination', 'Your task has been approved.', 1, '2025-10-13 10:22:55', 'b424841b-b72d-4d4d-a703-30565b3e7406', '3a02bd79-01db-476f-a1f8-e026d80a7ebc', 'task'),
('b761bd36-4f4b-4ff4-9cb2-5e8689d175d4', 'task_pending', 'Treatment', 'Your task is pending approval.', 1, '2025-10-13 08:11:52', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'b53aa0bc-ad0c-408a-8970-366898268e2f', 'task'),
('b83f7b70-5ba3-49c0-b62c-587a24abe11d', 'task_approved', 'Attack Detection Survey', 'Your task has been approved.', 1, '2025-10-01 23:50:46', 'e67174ed-e76f-412e-aebf-2e35b71add80', '57ad924f-d145-4ffd-9240-43d602a52602', 'task'),
('b9bf179a-7d9a-43b6-99c3-e79162857c8f', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 0, '2025-10-01 02:22:59', 'system-deleted-user', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('baf54410-0786-43ca-9e82-6e7d3c792d7e', 'task_commented', 'Mental State Examination', 'Aya Fouda commented on a task.', 1, '2025-10-14 09:00:46', 'e67174ed-e76f-412e-aebf-2e35b71add80', '3a02bd79-01db-476f-a1f8-e026d80a7ebc', 'task'),
('bbc6f06d-1361-4a1f-8d76-ec25444c46fc', 'project_updated', 'Project updated: LLM Safety and Security', 'Project details have been updated.', 1, '2025-10-01 23:49:04', 'ba437a54-de69-4b64-ac4a-883b84f26f36', '2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'project'),
('c0c8d868-4b0f-41d3-a2c6-2acb7987d2a2', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', 'system-deleted-user', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('c16cb553-ca10-4acf-a688-67d9ae42488e', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', 'system-deleted-user', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('c1d22150-bf86-4177-b01e-81bf17ee89a1', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a subtask.', 0, '2025-10-01 02:35:56', 'system-deleted-user', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('c20d3fb0-9bca-45f3-ae55-c99f88724880', 'task_approved', 'Weaviate account', 'Your task has been approved.', 1, '2025-10-19 10:35:23', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'dc4c96c6-e0f3-4a68-933a-ebd50ac898b0', 'task'),
('c3decbe2-0cd1-4f85-99b8-1f46beb8bc62', 'task_approved', 'Integrate all SCID modules in the prototype', 'Your task has been approved.', 1, '2025-10-02 00:01:25', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'f642623b-3c1f-45b7-bada-b9e9db7db22d', 'task'),
('c5f1b734-e9dd-4a6e-ba32-3cce184f7348', 'task_delete_request', 'Delete request for: test', 'test user has requested to delete the task \"test\".', 1, '2025-10-01 15:03:19', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('c7d40370-d45f-4a44-ac96-7cbf579c2539', 'task_pending_review', 'Check Facts and Check Hallucination', 'Check Facts and Check Hallucination is awaiting approval.', 1, '2025-10-13 08:13:30', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'd1feefe1-c052-40df-9f76-155c26466bc7', 'task'),
('c7e22ec7-0116-4647-a475-29a4b84c5451', 'task_assigned', 'test', 'You were assigned to a task.', 0, '2025-10-01 15:38:54', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('cd1fca02-91ed-4218-ae94-0f449b74d53f', 'task_pending', 'Wisal Story Development', 'Your task is pending approval.', 1, '2025-10-02 12:43:22', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b', 'e0eb2117-4dda-4d78-9be3-890a586fdd97', 'task'),
('ce987b5b-87c0-4de3-aeed-c1f09265e58c', 'admin_task_approved', 'Finalize and optimize the Wisal QA pipeline', 'Task \"Finalize and optimize the Wisal QA pipeline\" has been approved.', 1, '2025-10-06 16:09:01', 'e67174ed-e76f-412e-aebf-2e35b71add80', '811c948f-cf23-4117-8133-bb9537a0e78f', 'task'),
('cec9dec5-ed7c-44c8-96a0-d37ca2af5c57', 'admin_task_approved', 'Check Facts and Check Hallucination', 'Task \"Check Facts and Check Hallucination\" has been approved.', 1, '2025-10-13 10:23:04', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'd1feefe1-c052-40df-9f76-155c26466bc7', 'task'),
('d02550f8-2d8f-49fb-b535-fdc80c1d72dc', 'task_pending_review', 'Risk Assessment  (Suicide Ideation)', 'Risk Assessment  (Suicide Ideation) is awaiting approval.', 1, '2025-10-13 08:11:28', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'b4c79395-fbd4-4ce6-a347-edc9f6134441', 'task'),
('d366c917-5e33-4117-8120-8ab4fcfb374e', 'task_approved', 'DEDED', 'Your task has been approved.', 1, '2025-10-01 02:47:23', 'system-deleted-user', '392c1f73-100d-40ed-8663-4c69a54cd8b1', 'task'),
('d7487708-eeab-478a-9734-ae98c84644ea', 'admin_task_approved', 'Judging The Judge ', 'Task \"Judging The Judge \" has been approved.', 1, '2025-10-14 13:32:21', 'e67174ed-e76f-412e-aebf-2e35b71add80', '15dd34e9-b4ca-450d-abc0-59281663bcd4', 'task'),
('d7b6363f-309f-4e84-8c16-5cc98e50131b', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 0, '2025-10-01 02:24:16', 'system-deleted-user', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('d8c9f37a-762a-4015-be1c-3affd40405a1', 'mention', 'test task', 'Admin mentioned you in a task comment.', 0, '2025-10-05 18:39:33', 'e3409432-3000-4c3f-93b7-147b7bf1bf37', 'd9fee2c7-64f9-40bd-a9ff-f36de9382ca2', 'task'),
('dccece59-9a3a-4746-bf2a-f906daac5aee', 'task_commented', 'task - 4', 'Admin User commented on a task.', 0, '2025-10-01 18:57:02', 'system-deleted-user', 'f1b34881-eda9-4231-a34a-40efa5322ab6', 'task'),
('de655ee3-7f7a-4bcb-90af-3d8f8cfee835', 'project_updated', 'Project updated: test project - 2 (Copy) (Copy)', 'Project details have been updated.', 0, '2025-10-01 18:58:19', 'system-deleted-user', '9db2490a-2c49-4a75-8f0b-4b994fc79c63', 'project'),
('df5b1f79-260e-4247-884c-320c46901f20', 'project_updated', 'Project updated: Stocks/Trading Predication ', 'Project details have been updated.', 0, '2025-10-02 00:31:16', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b', 'b9fd6e5e-65b7-4692-a306-dd7a32a6b8dc', 'project'),
('e007ce7d-2a29-4b99-83cb-1d25094a18e4', 'admin_task_approved', 'Modify reviewer comments on the psychiatry test paper', 'Task \"Modify reviewer comments on the psychiatry test paper\" has been approved.', 1, '2025-10-21 20:24:05', 'e67174ed-e76f-412e-aebf-2e35b71add80', '7b831c8d-d5bc-413c-9379-e83a69983041', 'task'),
('e458160f-cc79-41ef-915b-2e5484dcf8c7', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:54', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('e4ee7cc3-e4dc-45f8-9656-cbf165baae36', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 0, '2025-10-01 23:08:36', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('e546830f-f1c6-4998-9a85-7ecd76927f7c', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 1, '2025-10-01 23:08:36', 'b424841b-b72d-4d4d-a703-30565b3e7406', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('e5af2603-a5dc-4f46-809e-dfb4e743bf50', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 1, '2025-10-13 11:29:24', 'e67174ed-e76f-412e-aebf-2e35b71add80', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('e5bc5750-0f67-48b9-ad26-71b67530a5f6', 'task_pending', 'Physical Examination', 'Your task is pending approval.', 1, '2025-10-13 08:12:11', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'ccf90c1b-d412-44c0-87ea-fd9d5784b862', 'task'),
('e6896122-39e8-4b11-8e54-cd46496dd63a', 'project_updated', 'Project updated: PsychiatrAi', 'Project details have been updated.', 1, '2025-10-02 00:00:33', 'e67174ed-e76f-412e-aebf-2e35b71add80', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'project'),
('e7ebf1ea-12d9-4bcc-8e9d-2c5fd1bbee3d', 'project_updated', 'Project updated: PsychiatrAi', 'Project details have been updated.', 0, '2025-10-01 23:59:41', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'project'),
('e8e405ac-759c-42fc-a5d2-d4ff4ce2f884', 'task_pending_review', 'test', 'test is awaiting approval.', 1, '2025-10-01 15:00:04', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('ea866e3b-3a16-4292-af88-871fdf0ef3e5', 'task_commented', 'test', 'test user commented on a task.', 1, '2025-10-01 15:33:33', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('ea8e4d32-4c58-4de1-a543-2ace4460c83e', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 1, '2025-10-01 23:08:36', 'e67174ed-e76f-412e-aebf-2e35b71add80', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('ea92fe64-73f6-4132-a48e-6a18d743ff04', 'project_updated', 'Project updated: PsychiatrAi', 'Project details have been updated.', 0, '2025-10-02 00:00:33', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'project'),
('ed028b51-e4ff-4a26-8d15-c214966fa557', 'task_commented', 'task - 4', 'Admin User commented on a task.', 0, '2025-10-01 18:56:59', 'system-deleted-user', 'f1b34881-eda9-4231-a34a-40efa5322ab6', 'task'),
('ed66f181-d197-4d48-ae0a-00e99eecbf60', 'task_approved', 'test task', 'Your task has been approved.', 1, '2025-10-05 18:38:54', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'd9fee2c7-64f9-40bd-a9ff-f36de9382ca2', 'task'),
('ef81b549-6ae8-4b1a-8b30-0d9fb2234793', 'project_updated', 'Project updated: Autism', 'Project details have been updated.', 0, '2025-10-13 11:29:24', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'project'),
('f07996e3-7158-4623-a510-effccdf4838b', 'task_commented', 'test', 'test user commented on a task.', 1, '2025-10-01 15:00:33', 'system-deleted-user', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('f4071b49-2c89-4172-b067-53e07486893b', 'task_pending_review', 'Treatment', 'Treatment is awaiting approval.', 1, '2025-10-13 08:11:53', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'b53aa0bc-ad0c-408a-8970-366898268e2f', 'task'),
('f435610c-c050-4985-9755-71c78663e4d9', 'project_updated', 'Project updated: Stocks/Trading Predication ', 'Project details have been updated.', 1, '2025-10-02 00:31:16', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'b9fd6e5e-65b7-4692-a306-dd7a32a6b8dc', 'project'),
('f4bf9496-bd91-4352-b37a-391e0df1142e', 'task_commented', 'Wisal Image features/bug list', 'Mohamed Essawey commented on a subtask.', 1, '2025-10-24 08:35:55', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'e634ef04-190c-4609-87a3-0f60bf795232', 'task'),
('f6e0ae16-6380-467b-aca9-bb6ace117528', 'admin_task_approved', 'Add a \"😀\"', 'Task \"Add a \"😀\"\" has been approved.', 1, '2025-10-24 13:00:02', 'e67174ed-e76f-412e-aebf-2e35b71add80', '59879f12-8254-4e03-93dc-d1e728a08c89', 'task'),
('f977df39-aa4d-4d93-a9b2-945c3c4cdac8', 'admin_task_approved', 'Follow up Questions', 'Task \"Follow up Questions\" has been approved.', 1, '2025-10-15 13:57:57', 'e67174ed-e76f-412e-aebf-2e35b71add80', '9949bba5-caed-41ba-aacd-ae615a9f989a', 'task'),
('f9c28710-4ec1-4c77-a547-f56c48f6d380', 'task_pending_review', 'Wisal Story Development', 'Wisal Story Development is awaiting approval.', 1, '2025-10-02 12:43:22', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'e0eb2117-4dda-4d78-9be3-890a586fdd97', 'task'),
('fc2491e7-969f-4f51-8524-2d87f2e2400f', 'timesheet_submitted', 'Timesheet submitted', 'A timesheet for 2025-10 has been submitted', 1, '2025-10-01 15:09:02', 'system-deleted-user', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet');

-- --------------------------------------------------------

--
-- Table structure for table `notifications_backup`
--

CREATE TABLE `notifications_backup` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `related_type` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'task | project | subtask | meeting'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime NOT NULL,
  `due_date` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `progress` int NOT NULL,
  `owner_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `estimated_hours` decimal(10,2) DEFAULT NULL,
  `actual_hours` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `status`, `priority`, `start_date`, `due_date`, `created_at`, `updated_at`, `completed_at`, `progress`, `owner_id`, `color`, `budget`, `estimated_hours`, `actual_hours`) VALUES
('195134c5-3a1e-4249-80b3-3de1e57782d1', 'Autism', 'Build a platform for helping autistic children to improve their engagement level and expressive skills.', 'active', 'high', '2025-10-01 00:00:00', '2025-12-31 00:00:00', '2025-10-01 23:04:26', '2025-10-24 13:00:03', NULL, 61, '06de0cce-5c75-4f7a-b7ba-bb0d51557182', 'amber', NULL, NULL, NULL),
('2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'LLM Safety and Security', 'Build new defense methods for LLMs', 'active', 'medium', '2025-10-01 00:00:00', '2025-12-31 00:00:00', '2025-10-01 23:48:48', '2025-10-22 11:42:05', NULL, 55, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'red', NULL, NULL, NULL),
('6f8ac341-7733-438f-9b84-9ec458b100c9', 'PsychiatrAi', 'Built an agentic system to replace the clinical psychiatrist', 'active', 'high', '2025-10-01 00:00:00', '2025-12-31 00:00:00', '2025-10-01 23:59:04', '2025-10-21 20:24:06', NULL, 0, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'indigo', NULL, NULL, NULL),
('b9fd6e5e-65b7-4692-a306-dd7a32a6b8dc', 'Stocks/Trading Predication', 'Develop models for accurate stock prediction for the Egyptian and Middle East markets.', 'active', 'low', '2025-10-01 00:00:00', '2025-12-31 00:00:00', '2025-10-02 00:30:03', '2025-10-02 00:31:16', NULL, 0, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'indigo', NULL, NULL, NULL),
('ebbc0ee6-ce2c-4001-a73c-5d55c09b1b7b', 'Misc', 'To cover any additional tasks outside main projects', 'planning', 'medium', '2025-10-01 00:00:00', '2027-10-14 00:00:00', '2025-10-05 10:49:10', '2025-10-19 10:40:21', NULL, 34, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'cyan', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_documents`
--

CREATE TABLE `project_documents` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_by_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_notes`
--

CREATE TABLE `project_notes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT '0',
  `created_by_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_tags`
--

CREATE TABLE `project_tags` (
  `project_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_tags`
--

INSERT INTO `project_tags` (`project_id`, `tag`) VALUES
('195134c5-3a1e-4249-80b3-3de1e57782d1', 'Autism'),
('195134c5-3a1e-4249-80b3-3de1e57782d1', 'VLMs'),
('2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'LLMs'),
('2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'Safety'),
('2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'Security'),
('6f8ac341-7733-438f-9b84-9ec458b100c9', 'LLMs'),
('6f8ac341-7733-438f-9b84-9ec458b100c9', 'Psychiatry'),
('b9fd6e5e-65b7-4692-a306-dd7a32a6b8dc', 'Stocks'),
('b9fd6e5e-65b7-4692-a306-dd7a32a6b8dc', 'Trading');

-- --------------------------------------------------------

--
-- Table structure for table `project_team`
--

CREATE TABLE `project_team` (
  `project_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_team`
--

INSERT INTO `project_team` (`project_id`, `user_id`) VALUES
('195134c5-3a1e-4249-80b3-3de1e57782d1', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f'),
('195134c5-3a1e-4249-80b3-3de1e57782d1', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b'),
('195134c5-3a1e-4249-80b3-3de1e57782d1', 'b424841b-b72d-4d4d-a703-30565b3e7406'),
('195134c5-3a1e-4249-80b3-3de1e57782d1', 'ec723edd-d5bb-4877-a80e-a13a7a35db16'),
('2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'ba437a54-de69-4b64-ac4a-883b84f26f36'),
('6f8ac341-7733-438f-9b84-9ec458b100c9', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f'),
('6f8ac341-7733-438f-9b84-9ec458b100c9', 'b424841b-b72d-4d4d-a703-30565b3e7406'),
('b9fd6e5e-65b7-4692-a306-dd7a32a6b8dc', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b'),
('b9fd6e5e-65b7-4692-a306-dd7a32a6b8dc', 'b424841b-b72d-4d4d-a703-30565b3e7406'),
('ebbc0ee6-ce2c-4001-a73c-5d55c09b1b7b', '06de0cce-5c75-4f7a-b7ba-bb0d51557182'),
('ebbc0ee6-ce2c-4001-a73c-5d55c09b1b7b', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f'),
('ebbc0ee6-ce2c-4001-a73c-5d55c09b1b7b', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b'),
('ebbc0ee6-ce2c-4001-a73c-5d55c09b1b7b', 'b424841b-b72d-4d4d-a703-30565b3e7406'),
('ebbc0ee6-ce2c-4001-a73c-5d55c09b1b7b', 'ba437a54-de69-4b64-ac4a-883b84f26f36');

-- --------------------------------------------------------

--
-- Table structure for table `push_subscriptions`
--

CREATE TABLE `push_subscriptions` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `endpoint` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `p256dh` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `auth` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaires`
--

CREATE TABLE `questionnaires` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `created_by_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deadline` datetime NOT NULL,
  `is_mandatory` tinyint(1) DEFAULT '1',
  `allow_late_submission` tinyint(1) DEFAULT '0',
  `show_results_to_users` tinyint(1) DEFAULT '0',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_answers`
--

CREATE TABLE `questionnaire_answers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `response_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer_text` text COLLATE utf8mb4_unicode_ci,
  `answer_value` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `answer_number` decimal(10,2) DEFAULT NULL,
  `answer_file_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `answer_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_feedback`
--

CREATE TABLE `questionnaire_feedback` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `response_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_critical` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_history`
--

CREATE TABLE `questionnaire_history` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionnaire_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `response_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_questions`
--

CREATE TABLE `questionnaire_questions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionnaire_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_required` tinyint(1) DEFAULT '1',
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `min_value` int DEFAULT NULL,
  `max_value` int DEFAULT NULL,
  `max_file_size` int DEFAULT NULL,
  `allowed_file_types` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `placeholder_text` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `help_text` text COLLATE utf8mb4_unicode_ci,
  `display_order` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_responses`
--

CREATE TABLE `questionnaire_responses` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionnaire_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `submitted_at` datetime DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_notes` text COLLATE utf8mb4_unicode_ci,
  `is_late` tinyint(1) DEFAULT '0',
  `score` decimal(5,2) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_targets`
--

CREATE TABLE `questionnaire_targets` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionnaire_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_notified` tinyint(1) DEFAULT '0',
  `notified_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subtasks`
--

CREATE TABLE `subtasks` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `task_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'todo',
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `start_date` datetime DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `assignee_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subtasks`
--

INSERT INTO `subtasks` (`id`, `task_id`, `title`, `description`, `status`, `completed`, `start_date`, `due_date`, `created_at`, `updated_at`, `assignee_id`, `priority`) VALUES
('06380b6b-1e41-445c-a3d5-749d2c7a5688', '36806bac-a84b-4916-9063-ba040f76caf5', 'Document all availbale APIs and limitation of all of them.', '', 'done', 1, NULL, '2025-10-07 00:00:00', '2025-10-05 10:52:45', '2025-10-19 10:39:31', NULL, NULL),
('0a7bb361-a18f-4db2-94b0-21c6c24469fd', '9949bba5-caed-41ba-aacd-ae615a9f989a', 'Summary for Doctors (Topics and Points)', '', 'todo', 1, NULL, '2025-10-23 00:00:00', '2025-10-20 10:47:22', '2025-10-21 18:36:06', NULL, NULL),
('0f555e00-3320-4bcc-a184-28857ad708d6', '36806bac-a84b-4916-9063-ba040f76caf5', 'Test a fine-tuning job', '', 'todo', 0, NULL, '2025-10-21 00:00:00', '2025-10-19 10:40:21', '2025-10-19 10:40:21', NULL, NULL),
('145672e6-7e6b-4174-9d0c-9cd8d5d82902', 'e634ef04-190c-4609-87a3-0f60bf795232', 'Bug List', '', 'review', 0, NULL, '2025-10-16 00:00:00', '2025-10-13 11:31:07', '2025-10-24 08:38:30', NULL, NULL),
('24346d01-7602-4ddf-bbdd-70a37511344d', '57ad924f-d145-4ffd-9240-43d602a52602', 'Blackbox - input monitoring', '', 'in-progress', 0, NULL, '2025-10-09 00:00:00', '2025-10-01 23:51:51', '2025-10-01 23:51:51', NULL, NULL),
('376feee7-0900-4a0f-bd89-632f792290e1', '0261f8aa-304c-4bdf-a749-7b751b0803e1', 'Judge evaluation and comparison', '', 'done', 1, NULL, '2025-10-16 00:00:00', '2025-10-05 10:30:50', '2025-10-17 04:22:22', NULL, NULL),
('3c805558-d4a1-4d8d-9781-9cb41349da52', '15dd34e9-b4ca-450d-abc0-59281663bcd4', 'Clean the datasets and define clear categories.', '', 'todo', 1, NULL, '2025-10-19 00:00:00', '2025-10-17 04:39:42', '2025-10-20 08:13:30', NULL, NULL),
('3ec060d4-31b7-4076-b7b4-c5674f3f9011', '0261f8aa-304c-4bdf-a749-7b751b0803e1', 'allam2 as a guard', '', 'done', 1, NULL, '2025-10-14 00:00:00', '2025-10-12 10:42:48', '2025-10-13 08:17:06', NULL, NULL),
('3fcd0936-d65f-4bd0-aa6e-ca36d1c8b188', '811c948f-cf23-4117-8133-bb9537a0e78f', 'Edit Dictate Audio', '', 'done', 1, NULL, '2025-10-16 00:00:00', '2025-10-13 06:45:48', '2025-10-19 19:28:53', NULL, NULL),
('51b3fcce-c4f5-4f9c-866c-06c3206ab6fe', '811c948f-cf23-4117-8133-bb9537a0e78f', 'Add a summary of chatbot history.', '', 'done', 1, NULL, '2025-10-14 00:00:00', '2025-10-13 06:44:45', '2025-10-19 19:28:40', NULL, NULL),
('5fe9974f-4472-4ddc-9e3b-af2c6cb1c860', 'f642623b-3c1f-45b7-bada-b9e9db7db22d', 'Bruteforce modules paths testing', '', 'todo', 0, NULL, '2025-10-21 00:00:00', '2025-10-19 10:42:09', '2025-10-19 10:42:09', NULL, NULL),
('6116f628-6776-45f4-a0c8-fd0858d7ef43', '1689958c-76ed-45ff-89f8-d7787ddf2238', 'List all missing features and bugs', '', 'todo', 0, NULL, '2025-10-18 00:00:00', '2025-10-04 17:57:05', '2025-10-04 17:57:05', NULL, NULL),
('6845bcc5-fe90-4385-b246-5423f203c365', '811c948f-cf23-4117-8133-bb9537a0e78f', 'Remove the rerank model and apply the new pipeline.', '', 'done', 1, NULL, '2025-10-16 00:00:00', '2025-10-13 06:47:52', '2025-10-19 19:28:34', NULL, NULL),
('72ac93b5-74d1-4358-86af-d6d77fd36f1f', '0261f8aa-304c-4bdf-a749-7b751b0803e1', 'Clearly identify metrics and polish the report in terms of writing and vigualization', '', 'done', 1, NULL, '2025-10-14 00:00:00', '2025-10-12 10:43:50', '2025-10-14 09:04:24', NULL, NULL),
('75215f6d-0d27-45f6-b1c2-9a5a85c6c973', '57ad924f-d145-4ffd-9240-43d602a52602', 'Blackbox - Output monitoring', '', 'in-progress', 0, NULL, '2025-10-09 00:00:00', '2025-10-01 23:52:12', '2025-10-01 23:52:12', NULL, NULL),
('788cbaa4-5214-4440-8fad-b35f0ff6a230', '0261f8aa-304c-4bdf-a749-7b751b0803e1', 'Arabic safety Dataset Documentation/report including comparisons and limitations', '', 'done', 1, NULL, '2025-10-06 00:00:00', '2025-10-05 10:30:06', '2025-10-12 14:51:33', NULL, NULL),
('88486d53-8974-439b-a486-94380c63bfcf', '5ce2de89-0d5f-4ab1-bb68-70ec63b1500e', 'Check out the live audio and upload it to Huggingface for testing.', '', 'in-progress', 1, NULL, '2025-10-06 00:00:00', '2025-10-05 10:34:26', '2025-10-06 10:51:23', NULL, NULL),
('983bc264-44db-44a0-8e3f-d37fb198e00f', 'e634ef04-190c-4609-87a3-0f60bf795232', 'Image Segmentation', '', 'done', 1, NULL, '2025-10-19 00:00:00', '2025-10-13 11:32:34', '2025-10-24 08:35:36', NULL, NULL),
('9af08ab6-45ac-4a1b-afb8-f539e212c34e', '57ad924f-d145-4ffd-9240-43d602a52602', 'Blackbox - Intermediate monitoring', '', 'in-progress', 0, NULL, '2025-10-16 00:00:00', '2025-10-01 23:52:39', '2025-10-01 23:52:39', NULL, NULL),
('ab946bfe-9a69-4905-8191-8be639399715', '15dd34e9-b4ca-450d-abc0-59281663bcd4', 'search on how to do better translation', '', 'todo', 0, NULL, '2025-12-31 00:00:00', '2025-10-19 12:13:09', '2025-10-19 12:13:09', NULL, NULL),
('acc98e10-d620-4ee4-b79d-9895768b57e4', '36806bac-a84b-4916-9063-ba040f76caf5', 'Create platform using Together API including the interface using Gradio', '', 'done', 1, NULL, '2025-10-09 00:00:00', '2025-10-05 10:54:14', '2025-10-19 10:39:41', NULL, NULL),
('ad8e4a3d-0b71-4c92-9703-aa140b5ea6c8', 'f642623b-3c1f-45b7-bada-b9e9db7db22d', 'Create demo and host on Azure', '', 'todo', 0, NULL, '2025-10-23 00:00:00', '2025-10-19 10:46:58', '2025-10-19 10:46:58', NULL, NULL),
('afe4223b-7985-434c-ae90-5e9ebb0a5cb5', 'f642623b-3c1f-45b7-bada-b9e9db7db22d', 'Special paths testing (path testing on books cases)', '', 'todo', 0, NULL, '2025-10-26 00:00:00', '2025-10-19 10:45:49', '2025-10-19 10:45:49', NULL, NULL),
('b228ec53-29d8-4e34-8697-cf99431aace0', 'f642623b-3c1f-45b7-bada-b9e9db7db22d', 'Search for Simulation techniques', '', 'todo', 0, NULL, '2025-10-21 00:00:00', '2025-10-19 10:43:45', '2025-10-19 10:43:45', NULL, NULL),
('b236f2db-febe-460b-9fbd-ff9e889b772b', '9949bba5-caed-41ba-aacd-ae615a9f989a', 'Access to doctor and patient', '', 'planning', 1, NULL, '2025-10-31 00:00:00', '2025-10-15 13:36:48', '2025-10-21 18:36:11', NULL, NULL),
('b6c89c9a-260f-4e95-9c9d-8ae3e8d7e71f', '0261f8aa-304c-4bdf-a749-7b751b0803e1', 'Allam 2 safety benchmarking on Qwen3Guard and LLamaGuard-4 + documentation/report', '', 'done', 1, NULL, '2025-10-07 00:00:00', '2025-10-05 10:31:53', '2025-10-07 11:09:41', NULL, NULL),
('bd89ed42-b65a-4a51-b823-7444275f33e6', 'e0eb2117-4dda-4d78-9be3-890a586fdd97', 'Panel Narrartion Extraction from prompt (Instead of gemini vision)', '', 'done', 1, NULL, '2025-10-07 00:00:00', '2025-10-02 12:44:14', '2025-10-13 10:40:26', NULL, NULL),
('c4f0bee3-3822-4319-bf27-853361c0488a', '9949bba5-caed-41ba-aacd-ae615a9f989a', 'Follow-up questions tests', '', 'todo', 1, NULL, '2025-10-23 00:00:00', '2025-10-20 10:48:22', '2025-10-21 18:36:35', NULL, NULL),
('d670d12a-391b-409d-a559-07bca4a0458e', 'f642623b-3c1f-45b7-bada-b9e9db7db22d', 'Roleplaying testing (full interview pipeline simulation testing using book cases)', '', 'todo', 0, NULL, '2025-10-28 00:00:00', '2025-10-19 10:49:00', '2025-10-19 10:49:00', NULL, NULL),
('d9c85c62-a48b-48df-83c7-ecc64b4df5ea', '9949bba5-caed-41ba-aacd-ae615a9f989a', 'Record logs for the session and the session summary.', '', 'done', 1, NULL, '2025-10-31 00:00:00', '2025-10-15 13:32:50', '2025-10-20 10:47:30', NULL, NULL),
('dc8367b2-f6b4-4328-b29f-6f3df4a68e31', '0261f8aa-304c-4bdf-a749-7b751b0803e1', 'think of possible directions to publish arabic evaluations as a paper', '', 'planning', 0, NULL, '2025-10-16 00:00:00', '2025-10-12 10:44:36', '2025-10-22 11:42:05', NULL, NULL),
('df0028a9-d8e8-4d35-87e1-f12a6db2b491', 'e0eb2117-4dda-4d78-9be3-890a586fdd97', 'Story and Final Prompt Generation', '', 'done', 1, NULL, '2025-10-07 00:00:00', '2025-10-02 12:44:52', '2025-10-13 09:36:48', NULL, NULL),
('e3c2d995-4de1-48cf-ad02-1b30f5fa7824', '0261f8aa-304c-4bdf-a749-7b751b0803e1', 'benchmark other SOTA Arabic models', '', 'todo', 0, NULL, '2026-01-19 00:00:00', '2025-10-19 12:15:20', '2025-10-19 12:15:59', NULL, NULL),
('eabaf2d1-ca56-4ed5-b9c7-1be1e9d138e7', '5ce2de89-0d5f-4ab1-bb68-70ec63b1500e', 'host Wisal QA live on Azure', '', 'in-progress', 1, NULL, '2025-10-02 00:00:00', '2025-10-01 23:08:01', '2025-10-05 10:30:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subtask_assignees`
--

CREATE TABLE `subtask_assignees` (
  `subtask_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subtask_tags`
--

CREATE TABLE `subtask_tags` (
  `subtask_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `priority` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime NOT NULL,
  `due_date` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_by_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `progress` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `project_id`, `title`, `description`, `status`, `priority`, `start_date`, `due_date`, `created_at`, `updated_at`, `completed_at`, `created_by_id`, `approval_status`, `approved_at`, `approved_by_id`, `rejection_reason`, `progress`) VALUES
('0261f8aa-304c-4bdf-a749-7b751b0803e1', '2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'Allam2  safety Benchmarking', 'We aim to fully benchmark the safety and alignment of Allam on Arabic harmful datasets. ', 'in-progress', 'medium', '2025-10-01 00:00:00', '2025-10-09 00:00:00', '2025-10-05 10:29:28', '2025-10-22 11:42:05', NULL, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 71),
('15dd34e9-b4ca-450d-abc0-59281663bcd4', '2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'Judging The Judge ', '', 'todo', 'medium', '2025-10-14 10:54:12', '2025-12-25 00:00:00', '2025-10-14 10:54:12', '2025-10-20 08:13:30', NULL, 'ba437a54-de69-4b64-ac4a-883b84f26f36', 'approved', '2025-10-14 13:32:22', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 50),
('1689958c-76ed-45ff-89f8-d7787ddf2238', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'Wisal Image features upgrade', '', 'todo', 'medium', '2025-10-04 17:56:27', '2025-10-04 17:56:27', '2025-10-04 17:56:27', '2025-10-04 17:57:05', NULL, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 0),
('267db3d0-041b-4fbf-add5-c5963b949a24', '2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'complete comments in the documentation/report', '', 'done', 'medium', '2025-10-07 00:00:00', '2025-10-09 00:00:00', '2025-10-07 17:27:31', '2025-10-12 10:47:51', '2025-10-12 10:47:51', 'ba437a54-de69-4b64-ac4a-883b84f26f36', 'approved', '2025-10-07 18:12:10', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 100),
('3497a748-6236-49a4-ba4a-3c1499893cc2', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'Screening and patient history integration', 'Integrate patient physical, mental, and personal history and screen questionnaires into the platform', 'in-progress', 'medium', '2025-10-01 00:00:00', '2025-10-09 00:00:00', '2025-10-02 00:20:21', '2025-10-06 10:52:39', NULL, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 0),
('36806bac-a84b-4916-9063-ba040f76caf5', 'ebbc0ee6-ce2c-4001-a73c-5d55c09b1b7b', 'Fine Tuning tool using APIs', 'Create an interface for COmpumacy for direct fine-tuning through APIs where the user can upload a dataset directly and choose a loss function, fine-tuning and quantization, then use the fine-tuned model to run tasks.', 'in-progress', 'medium', '2025-10-01 00:00:00', '2025-11-08 00:00:00', '2025-10-05 10:51:27', '2025-10-19 10:40:21', NULL, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 67),
('3a02bd79-01db-476f-a1f8-e026d80a7ebc', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'Mental State Examination', '', 'review', 'medium', '2025-10-12 00:00:00', '2025-10-19 00:00:00', '2025-10-13 08:08:26', '2025-10-14 10:52:50', NULL, 'b424841b-b72d-4d4d-a703-30565b3e7406', 'approved', '2025-10-13 10:22:55', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 0),
('57ad924f-d145-4ffd-9240-43d602a52602', '2106bf53-3029-4e9a-9a71-f8a9aaf4cec9', 'Attack Detection Survey', 'Survey all the methods in the literature on LLMs Attacks and guardrails', 'in-progress', 'medium', '2025-10-01 00:00:00', '2025-10-31 00:00:00', '2025-10-01 23:50:46', '2025-10-01 23:55:10', NULL, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 0),
('59879f12-8254-4e03-93dc-d1e728a08c89', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'Add a \"😀\"', 'Add a \"😀\" in the middle of the detected object in wisal image', 'in-progress', 'medium', '2025-10-24 08:42:03', '2025-10-24 08:42:03', '2025-10-24 08:42:03', '2025-10-24 13:00:03', NULL, 'ec723edd-d5bb-4877-a80e-a13a7a35db16', 'approved', '2025-10-24 13:00:03', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 0),
('5ce2de89-0d5f-4ab1-bb68-70ec63b1500e', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'Wisal QA live', 'Build a conversational chatbot for autism to assist patients and doctors.', 'done', 'high', '2025-10-01 00:00:00', '2025-10-09 00:00:00', '2025-10-01 23:06:32', '2025-10-06 10:52:08', '2025-10-06 10:52:08', 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 100),
('6cc2fe35-ea1f-4fa6-bd81-6c10513de0bb', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'Scene Graph prompting ', 'I started prompting Gemini-Pro-2.5 model to provide me the Scene Graph with coordinates, in different prompt techniques', 'review', 'medium', '2025-10-21 08:40:48', '2025-10-21 08:40:48', '2025-10-21 08:40:48', '2025-10-24 08:38:47', NULL, 'ec723edd-d5bb-4877-a80e-a13a7a35db16', 'approved', '2025-10-21 20:24:02', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 0),
('7b831c8d-d5bc-413c-9379-e83a69983041', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'Modify reviewer comments on the psychiatry test paper', '', 'todo', 'high', '2025-10-20 00:00:00', '2025-10-30 00:00:00', '2025-10-20 03:33:03', '2025-10-21 20:24:06', NULL, 'b424841b-b72d-4d4d-a703-30565b3e7406', 'approved', '2025-10-21 20:24:05', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 0),
('811c948f-cf23-4117-8133-bb9537a0e78f', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'Finalize and optimize the Wisal QA pipeline', '', 'todo', 'medium', '2025-10-06 14:38:37', '2025-10-13 00:00:00', '2025-10-06 14:38:37', '2025-10-19 19:28:53', NULL, 'b424841b-b72d-4d4d-a703-30565b3e7406', 'approved', '2025-10-06 16:09:02', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 100),
('9949bba5-caed-41ba-aacd-ae615a9f989a', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'Follow up Questions', '', 'done', 'medium', '2025-10-13 00:00:00', '2025-10-31 00:00:00', '2025-10-15 13:31:45', '2025-10-21 18:36:35', '2025-10-21 18:36:29', 'b424841b-b72d-4d4d-a703-30565b3e7406', 'approved', '2025-10-15 13:57:58', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 100),
('abf66e55-efff-4880-8e3d-699c42124797', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'Summarized the patient’s history', 'Waiting for Dr. Radwa\'s review', 'review', 'medium', '2025-10-15 00:00:00', '2025-10-31 00:00:00', '2025-10-15 13:29:45', '2025-10-15 13:57:59', NULL, 'b424841b-b72d-4d4d-a703-30565b3e7406', 'approved', '2025-10-15 13:57:59', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 0),
('b4c79395-fbd4-4ce6-a347-edc9f6134441', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'Risk Assessment  (Suicide Ideation)', '', 'todo', 'medium', '2025-10-12 00:00:00', '2025-10-16 00:00:00', '2025-10-13 08:11:26', '2025-10-13 10:22:57', NULL, 'b424841b-b72d-4d4d-a703-30565b3e7406', 'approved', '2025-10-13 10:22:57', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 0),
('b53aa0bc-ad0c-408a-8970-366898268e2f', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'Treatment', '', 'todo', 'medium', '2025-10-12 00:00:00', '2025-10-19 00:00:00', '2025-10-13 08:11:53', '2025-10-13 10:23:00', NULL, 'b424841b-b72d-4d4d-a703-30565b3e7406', 'approved', '2025-10-13 10:23:00', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 0),
('c94e6b45-e77e-4ffc-a6b1-82c9f3cb51b0', 'b9fd6e5e-65b7-4692-a306-dd7a32a6b8dc', 'Survey models and techniques', '', 'todo', 'medium', '2025-10-01 00:00:00', '2025-10-31 00:00:00', '2025-10-02 00:30:56', '2025-10-02 00:30:56', NULL, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 0),
('ccf90c1b-d412-44c0-87ea-fd9d5784b862', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'Physical Examination', '', 'review', 'medium', '2025-10-12 00:00:00', '2025-10-19 00:00:00', '2025-10-13 08:12:12', '2025-10-15 13:26:14', NULL, 'b424841b-b72d-4d4d-a703-30565b3e7406', 'approved', '2025-10-13 10:23:01', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 0),
('cf8444b9-bc83-49ac-b8b4-7ddd8deafa75', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'read this paper https://arxiv.org/pdf/2404.00906', '', 'done', 'medium', '2025-10-22 11:20:00', '2025-10-22 11:20:00', '2025-10-22 11:20:00', '2025-10-24 08:39:06', '2025-10-24 08:39:06', 'ec723edd-d5bb-4877-a80e-a13a7a35db16', 'approved', '2025-10-22 16:33:03', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 100),
('d1feefe1-c052-40df-9f76-155c26466bc7', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'Check Facts and Check Hallucination', '', 'todo', 'medium', '2025-10-12 00:00:00', '2025-10-19 00:00:00', '2025-10-13 08:13:29', '2025-10-13 10:23:04', NULL, 'b424841b-b72d-4d4d-a703-30565b3e7406', 'approved', '2025-10-13 10:23:04', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 0),
('dc4c96c6-e0f3-4a68-933a-ebd50ac898b0', 'ebbc0ee6-ce2c-4001-a73c-5d55c09b1b7b', 'Weaviate account', '', 'todo', 'medium', '2025-10-19 10:35:24', '2025-10-19 10:35:24', '2025-10-19 10:35:24', '2025-10-19 10:37:05', NULL, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 0),
('e0eb2117-4dda-4d78-9be3-890a586fdd97', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'Wisal Story Development', '', 'todo', 'medium', '2025-10-02 00:00:00', '2025-10-31 00:00:00', '2025-10-02 12:43:22', '2025-10-13 10:40:26', NULL, '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b', 'approved', '2025-10-02 12:44:48', 'e67174ed-e76f-412e-aebf-2e35b71add80', NULL, 100),
('e634ef04-190c-4609-87a3-0f60bf795232', '195134c5-3a1e-4249-80b3-3de1e57782d1', 'Wisal Image features/bug list', '', 'in-progress', 'medium', '2025-10-13 00:00:00', '2025-10-24 00:00:00', '2025-10-13 11:29:06', '2025-10-24 08:38:30', NULL, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 50),
('f642623b-3c1f-45b7-bada-b9e9db7db22d', '6f8ac341-7733-438f-9b84-9ec458b100c9', 'Integrate all SCID modules in the prototype', '', 'in-progress', 'medium', '2025-10-01 00:00:00', '2025-10-09 00:00:00', '2025-10-02 00:01:25', '2025-10-19 10:49:00', NULL, 'e67174ed-e76f-412e-aebf-2e35b71add80', 'approved', NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `task_assignees`
--

CREATE TABLE `task_assignees` (
  `task_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_assignees`
--

INSERT INTO `task_assignees` (`task_id`, `user_id`) VALUES
('1689958c-76ed-45ff-89f8-d7787ddf2238', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f'),
('36806bac-a84b-4916-9063-ba040f76caf5', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f'),
('7b831c8d-d5bc-413c-9379-e83a69983041', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f'),
('f642623b-3c1f-45b7-bada-b9e9db7db22d', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f'),
('c94e6b45-e77e-4ffc-a6b1-82c9f3cb51b0', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b'),
('e0eb2117-4dda-4d78-9be3-890a586fdd97', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b'),
('3497a748-6236-49a4-ba4a-3c1499893cc2', 'b424841b-b72d-4d4d-a703-30565b3e7406'),
('5ce2de89-0d5f-4ab1-bb68-70ec63b1500e', 'b424841b-b72d-4d4d-a703-30565b3e7406'),
('7b831c8d-d5bc-413c-9379-e83a69983041', 'b424841b-b72d-4d4d-a703-30565b3e7406'),
('811c948f-cf23-4117-8133-bb9537a0e78f', 'b424841b-b72d-4d4d-a703-30565b3e7406'),
('0261f8aa-304c-4bdf-a749-7b751b0803e1', 'ba437a54-de69-4b64-ac4a-883b84f26f36'),
('15dd34e9-b4ca-450d-abc0-59281663bcd4', 'ba437a54-de69-4b64-ac4a-883b84f26f36'),
('267db3d0-041b-4fbf-add5-c5963b949a24', 'ba437a54-de69-4b64-ac4a-883b84f26f36'),
('57ad924f-d145-4ffd-9240-43d602a52602', 'ba437a54-de69-4b64-ac4a-883b84f26f36'),
('dc4c96c6-e0f3-4a68-933a-ebd50ac898b0', 'e9f05589-b1ef-43d7-a786-980d3781a9db'),
('59879f12-8254-4e03-93dc-d1e728a08c89', 'ec723edd-d5bb-4877-a80e-a13a7a35db16'),
('6cc2fe35-ea1f-4fa6-bd81-6c10513de0bb', 'ec723edd-d5bb-4877-a80e-a13a7a35db16'),
('cf8444b9-bc83-49ac-b8b4-7ddd8deafa75', 'ec723edd-d5bb-4877-a80e-a13a7a35db16'),
('e634ef04-190c-4609-87a3-0f60bf795232', 'ec723edd-d5bb-4877-a80e-a13a7a35db16');

-- --------------------------------------------------------

--
-- Table structure for table `task_tags`
--

CREATE TABLE `task_tags` (
  `task_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_tags`
--

INSERT INTO `task_tags` (`task_id`, `tag`) VALUES
('5ce2de89-0d5f-4ab1-bb68-70ec63b1500e', 'chatbot');

-- --------------------------------------------------------

--
-- Table structure for table `timesheets`
--

CREATE TABLE `timesheets` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `month` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `submitted_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `return_comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rejected_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timesheets`
--

INSERT INTO `timesheets` (`id`, `user_id`, `month`, `status`, `submitted_at`, `approved_at`, `approved_by_id`, `returned_at`, `return_comments`, `rejected_at`, `created_at`, `updated_at`) VALUES
('0226ad04-f4a9-4c8e-a12e-18c268503300', 'ba437a54-de69-4b64-ac4a-883b84f26f36', '2025-11', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-02 03:35:19', NULL),
('353a328a-7113-4cb2-bb08-58ba2b676242', '96b7ad39-fd1b-4190-8cb7-1e0a70380c1b', '2025-10', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-06 09:31:07', '2025-10-13 09:32:14'),
('56c4c593-8bb5-49ed-987a-103b651afff0', 'ba437a54-de69-4b64-ac4a-883b84f26f36', '2025-09', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-08 07:28:15', NULL),
('65d877ce-49c0-47d5-9f69-5852f9b03ae2', 'system-deleted-user', '2025-11', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-01 15:08:35', NULL),
('84c3a7fa-ec13-4bf9-9b4f-af42aeaca9cc', 'b424841b-b72d-4d4d-a703-30565b3e7406', '2025-10', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-03 15:14:49', NULL),
('9896c6d4-261f-485f-9d47-d1c511865fc4', '6157e6df-ffa3-479b-ae7e-d9c148d6c30f', '2025-10', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-04 19:11:50', '2025-10-19 10:38:25'),
('a601b413-2251-44c4-9c99-7069ac28b595', 'system-deleted-user', '2025-10', 'approved', '2025-10-01 15:13:09', '2025-10-01 15:13:41', NULL, '2025-10-01 15:12:26', 'ttt', NULL, '2025-10-01 15:08:41', '2025-10-01 15:08:55'),
('c276c4f7-4d2a-43ce-be4e-0c579b6179a6', 'ba437a54-de69-4b64-ac4a-883b84f26f36', '2025-08', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-08 07:28:19', NULL),
('e17c4403-59d4-4f4e-87ab-216c81d1c794', 'ba437a54-de69-4b64-ac4a-883b84f26f36', '2025-10', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-02 03:34:10', '2025-10-24 22:31:54');

-- --------------------------------------------------------

--
-- Table structure for table `timesheet_entries`
--

CREATE TABLE `timesheet_entries` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `timesheet_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hours` decimal(5,2) NOT NULL DEFAULT '0.00',
  `note` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timesheet_entries`
--

INSERT INTO `timesheet_entries` (`id`, `timesheet_id`, `date`, `hours`, `note`) VALUES
('00713aed-53f2-442c-b191-a4060ff87244', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-02', 7.00, NULL),
('059d9187-7b8e-4b66-81f1-1789b90c3755', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-09', 0.00, NULL),
('07413ec7-4fab-4702-be2b-30b9d723abe9', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-20', 0.00, NULL),
('0790aecb-c934-42da-8d45-000b8c043dd3', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-02', 0.00, NULL),
('082f4163-fd80-4e0b-b472-727f6e3c424c', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-06', 6.00, NULL),
('0b004fd9-8515-4abb-ac47-dedeedbb5392', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-13', 0.00, NULL),
('0bb92ac3-a389-44b6-a79d-452f134df046', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-07', 4.00, NULL),
('0c328bdd-5a64-4b4d-80d6-b85fd4068366', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-28', 0.00, NULL),
('0e62f876-00d4-431b-97ec-005d0cb9ad1e', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-23', 0.00, NULL),
('0ec50efd-7987-4156-b258-fee018aaa188', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-05', 0.00, NULL),
('0ec9327c-7f60-43f1-b54e-0264d3db65b1', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-01', 8.00, NULL),
('11f30e0e-899d-4347-a869-25d51b75951f', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-19', 0.00, NULL),
('187a8d4d-978a-498e-9a3c-4f1ab0580e3a', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-09', 0.00, NULL),
('18c53fdb-23b8-495a-98a0-10aa656b589e', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-16', 6.00, NULL),
('1e7d292c-289a-4d8b-ab6b-fc19cb89aeaf', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-07', 0.00, NULL),
('1f0a7fba-89a9-4350-aa59-e0b8225b1873', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-11', 0.00, NULL),
('20225f6e-edab-497e-a6ec-85e546bbc508', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-19', 0.00, NULL),
('20542d7d-36c8-441c-b76d-423efad62ae3', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-05', 8.00, NULL),
('20b82ab7-5c66-44bb-b714-7abb41c81a85', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-05', 5.00, NULL),
('20d293f2-5541-4bd4-8fc0-6ece9358fa5d', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-05', 8.00, NULL),
('22f1994d-8add-405a-b5f1-94ce03f94bd5', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-08', 0.00, NULL),
('2365b7fb-ae42-4a6d-9270-094201407254', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-01', 8.50, NULL),
('29f2b3ad-fc28-4604-8bbe-dc476c54bec3', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-29', 0.00, NULL),
('2b564808-d38b-4c81-b232-59c1d5d8adbc', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-04', 0.00, NULL),
('2c2def46-fdc9-4ac0-a5bf-8ff712dcc7cf', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-08', 0.00, NULL),
('2d4615df-23c5-40f3-aa8a-d4c253480a52', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-07', 5.00, NULL),
('2e4ab6c9-9d31-4414-99ef-74bb91098069', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-22', 0.00, NULL),
('3004f1c8-6226-416e-9182-73b67f3f0bab', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-08', 0.00, NULL),
('3096502b-0ba7-453a-bfe2-96a938122eff', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-17', 0.00, NULL),
('32036628-275d-480c-b35e-7e50dc948689', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-25', 0.00, NULL),
('33fa54c7-cd4b-45e7-8f8e-8e9263654b15', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-03', 0.00, NULL),
('3438da62-5c66-4bc8-b9e5-70dcc6c24913', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-30', 0.00, NULL),
('354532c6-cdd0-4c85-b7aa-3846b54988ff', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-15', 6.50, NULL),
('36c00343-d0a6-49f9-87d9-f7beeeafb2e4', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-27', 0.00, NULL),
('3760d132-8f4d-4a8c-8efd-fc518106f608', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-24', 0.00, NULL),
('3d31e509-4ee9-4c91-a9df-187df3942397', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-22', 0.00, NULL),
('3eddc5d3-19e6-48cf-b706-6b868fe33b77', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-31', 0.00, NULL),
('457561e4-fcd1-459e-bcb7-fd987d8f1e5e', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-16', 6.00, NULL),
('498646eb-3a68-4da9-b713-3568a13681ce', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-20', 0.00, NULL),
('4b943acf-39c3-4e59-8f8d-6d77aaa2aa01', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-04', 0.00, NULL),
('4e2136a4-e4e4-45e0-a921-529fcdb6e97b', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-25', 0.00, NULL),
('4ff2e8b7-d0f1-43bd-8eb4-63461d677b7f', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-27', 0.00, NULL),
('50d3bf1f-c0b5-43ff-ba24-a06d056c8492', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-16', 0.00, NULL),
('57f89aea-39de-43a2-ae2c-e51425724d5e', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-04', 4.50, NULL),
('58e30cc1-df58-45ea-b4af-9bf7afea7eae', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-12', 4.00, NULL),
('5a9cb46b-a9e5-4c8c-9fd5-01283bac6b01', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-16', 0.00, NULL),
('5b658cea-81dc-4225-8ec1-2bbbfc2c7c71', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-30', 0.00, NULL),
('5da3eacb-014f-4bd2-86af-d8a6af9b3ada', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-21', 0.00, NULL),
('5db0638c-061b-4215-b853-ff7490ad33d3', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-22', 7.50, NULL),
('6073000c-f37d-4b1d-a7a6-912dcfe1b523', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-14', 0.00, NULL),
('62270f1e-5d10-41b8-9834-e2e5118de40f', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-18', 4.00, NULL),
('68a89a34-992a-42e0-ab9b-596147513ad2', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-03', 0.00, NULL),
('69aba85e-d20b-463b-bfd5-fede9d773d6c', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-01', 7.00, NULL),
('6e8af7d1-caf1-445f-a146-a178f9ac3a99', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-14', 9.00, NULL),
('71d98091-dba8-4026-bfec-f43cdc0b1271', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-31', 0.00, NULL),
('75116daa-f940-4fb9-91de-782b62fdd42e', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-23', 0.00, NULL),
('77149462-c196-4843-ab2c-0fe23ad1ed48', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-12', 4.00, NULL),
('77611627-0090-4b99-823a-1e2610be0925', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-26', 0.00, NULL),
('79b19754-3ff7-48ea-bb11-e5cc4f2f945e', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-09', 0.00, NULL),
('79e9ce39-bc79-4d4c-9c4c-2d53fc300d01', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-31', 0.00, NULL),
('8446df2f-71a8-44b1-b896-2e8862adc9bc', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-19', 0.00, NULL),
('8907bed0-ac91-4f3c-a4b8-3d817730403b', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-10', 2.00, NULL),
('891e8b50-7226-4c56-a516-12e16aefb2a6', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-23', 0.00, NULL),
('8b4375b2-29f8-4e60-8038-4b79df7f2fc4', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-02', 0.00, NULL),
('90a33261-fe1c-4f4a-b94b-fd32f6478123', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-06', 0.00, NULL),
('9248af6e-5b44-4329-a3f1-aebc3e45ef61', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-25', 0.00, NULL),
('93d397ae-617a-46bb-bfa9-ada0b3ea9b8d', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-21', 8.00, NULL),
('96c195b1-f127-494d-a718-fd257189e8c4', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-30', 0.00, NULL),
('99e70ae8-e7d1-48b4-a2bf-3c60e3bc4f3a', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-24', 0.00, NULL),
('9c8049f6-a6eb-4b77-ab40-27e73ffb5678', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-13', 8.00, NULL),
('9de1a2ae-db25-4f27-8966-bec85ae05222', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-15', 0.00, NULL),
('a02ae3be-2e65-4767-a97b-88a535dc1900', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-09', 3.00, NULL),
('a2272e14-c4f7-4a39-8521-540c20816597', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-18', 1.50, NULL),
('a53c2c0a-551b-4d9d-8ede-e1ca8bdb80c2', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-26', 0.00, NULL),
('a5ec8a2e-8401-4ed4-b979-2ebec8abebd9', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-13', 0.00, NULL),
('a65dc142-2d61-46e9-bc77-72d741d87e94', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-28', 0.00, NULL),
('a74eadc3-deda-44ad-8f52-2728cbe69d69', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-02', 10.00, NULL),
('ad8e78f6-03b8-41fa-91ab-37d00ba3bf8f', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-18', 0.00, NULL),
('adef7a8d-4cc7-4d82-a112-ec1a50dad27b', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-25', 0.00, NULL),
('afdee124-59d7-4d09-b9e5-0bc53f19328b', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-17', 0.00, NULL),
('b3716b4b-a042-42ed-a42b-03a4db938661', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-28', 0.00, NULL),
('b5a53ce4-799f-462d-b50d-83d5c00d7441', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-03', 0.00, NULL),
('b5e511d6-da3b-4aee-b678-fb0f88a8ca1a', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-08', 4.50, NULL),
('b662d03d-1662-4c9f-ad03-2d8adbf11c64', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-10', 5.00, NULL),
('b6bd5c9a-3044-4f2b-8990-1c645aa10774', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-11', 0.00, NULL),
('b7b8dd62-d2bf-4ea4-adf6-ae7e6b99dced', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-04', 0.00, NULL),
('b9c51064-4ecd-411c-93f0-fded8d72c783', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-20', 8.50, NULL),
('baf815e0-e056-4c65-b3cf-6e3de6c18691', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-14', 0.00, NULL),
('be416ffd-aac1-41e3-a486-02b2f88dc924', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-28', 0.00, NULL),
('be94cb8b-e6df-4622-a9b5-ee14e88186a5', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-23', 6.00, NULL),
('c171e8e6-ad1f-48d5-916c-6453abf120f8', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-15', 0.00, NULL),
('c1b61b51-4441-4230-8467-f544f7b10bfa', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-12', 0.00, NULL),
('c3e5ecb7-a3aa-46e9-888c-eced5d974e50', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-18', 0.00, NULL),
('c7dc38da-6d16-449a-a6fa-e65c33ea3de8', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-21', 0.00, NULL),
('c8f0257c-fc9d-417b-8d6c-27249dfd9d28', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-06', 6.00, NULL),
('c9804af9-c963-4e72-bb37-ebce4ebb1e98', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-15', 6.00, NULL),
('d10d3787-a36f-4530-a4a0-98b850738ddd', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-07', 9.00, NULL),
('d353e836-374e-40c4-b964-a39543a424c6', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-30', 0.00, NULL),
('d5270dad-8603-4c00-8a56-2bcb69b85597', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-01', 12.00, NULL),
('d6dd2b32-9ab7-4b18-906e-e5734d6eed79', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-27', 0.00, NULL),
('d765b065-85fd-420f-8faa-a758fbfe13f8', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-29', 0.00, NULL),
('d9b0dba2-6583-492a-a388-a2b6d4df8db5', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-12', 8.00, NULL),
('d9e15c89-d80f-42f4-8d8f-8efd87fde129', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-31', 0.00, NULL),
('dc0fd216-303c-4dd7-9637-d056089c7b80', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-17', 6.00, NULL),
('de77cb4c-6d5f-4822-bff2-411bef5b2566', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-26', 0.00, NULL),
('df5316a1-1d52-43c1-a35b-b9c13cc49590', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-24', 0.00, NULL),
('e1127082-c04c-42fb-a3b2-5546ba7709d3', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-22', 0.00, NULL),
('e21ec460-91da-4144-9363-26b8c495270e', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-26', 0.00, NULL),
('e36a1eae-3dd9-4acf-b5df-3359842e2a99', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-21', 0.00, NULL),
('e39af7b8-2cc4-4553-bd8b-11c59066b6dc', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-10', 0.00, NULL),
('e480cc6e-4165-47f0-af4f-60407036805e', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-24', 2.00, NULL),
('e4dd86a0-5b82-43b2-bb87-5bccf177d406', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-27', 0.00, NULL),
('e4eef494-f42f-4b06-bafe-e16f5a9a38c9', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-11', 8.00, NULL),
('e5711ed0-f96a-4f27-a4ed-2c8d4fc6ca63', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-10', 0.00, NULL),
('e62fde13-ff8c-4e4e-a3d1-5ea8a0faac3e', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-29', 0.00, NULL),
('ede8b54d-2511-4e02-a5ea-eb49db8ca1ea', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-14', 7.00, NULL),
('f0a1d131-51d9-4136-943a-745140916960', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-20', 0.00, NULL),
('f12062f4-847b-4170-b7be-d6032acebb85', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-17', 0.00, NULL),
('f614db9a-9322-4742-9c2b-034e51499af0', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-19', 9.00, NULL),
('fa785115-b108-4874-895c-f3ecb3c7692e', 'e17c4403-59d4-4f4e-87ab-216c81d1c794', '2025-10-06', 8.50, NULL),
('fabb6b62-9288-4bf7-9220-1ba7810d7b5f', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-11', 0.00, NULL),
('fac13d31-a588-4db9-bb33-cbf7d001875b', '353a328a-7113-4cb2-bb08-58ba2b676242', '2025-10-29', 0.00, NULL),
('fc3f89ce-5f94-4575-aea6-59c0c36bcb6e', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-03', 0.00, NULL),
('ff89d403-6252-4215-828c-d88189a37062', '9896c6d4-261f-485f-9d47-d1c511865fc4', '2025-10-13', 4.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `initials` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `avatar`, `initials`, `role`, `status`, `password_hash`) VALUES
('06de0cce-5c75-4f7a-b7ba-bb0d51557182', 'Ahmed Elsheikh', 'ahmed@compumacy.com', NULL, 'AE', 'user', 'Inactive', '$2a$10$7Vu2HNg0zFEUUlFmyLNye.xc/nGAuvLG9Z2eX.lEoa.23409QEw7m'),
('6157e6df-ffa3-479b-ae7e-d9c148d6c30f', 'Abdelrahman Hesham', 'a.hesham@compumacy.com', NULL, 'AH', 'user', 'Inactive', '$2a$10$Gjk0pPWm0.khINyZaWfzoOKMYmR488/hGgKPWzwA13J1K5pVtwlAO'),
('96b7ad39-fd1b-4190-8cb7-1e0a70380c1b', 'Amr Ahmed', 'amr@compumacy.com', NULL, 'AA', 'user', 'Inactive', '$2a$10$kKw2gLtRABxLS5SRe1o5YeYgMUAzcEle41f/GuRXukn/rsCHTpZ/y'),
('b424841b-b72d-4d4d-a703-30565b3e7406', 'Aya Fouda', 'aya@compumacy.com', NULL, 'AF', 'user', 'Inactive', '$2a$10$zQzspsCuV4xS6K99wTTYKOw.hLlFEfOGKQU1CJ6MavRbgBk5RV1T2'),
('ba437a54-de69-4b64-ac4a-883b84f26f36', 'Omar Abdelnasser', 'omar@compumacy.com', NULL, 'OA', 'user', 'Inactive', '$2a$10$0byvjFFUOt4JeyT0dIeHluhKT2SeRpDwysig3ygOH1uobrh0.ojTu'),
('e3409432-3000-4c3f-93b7-147b7bf1bf37', 'test abdullah', 'ibnbattutatravel1@gmail.com', NULL, 'TA', 'user', 'Inactive', '$2a$10$JQ4zlx8RTn6tYuB.hdVKTeuP8J10aXMY6BkgNI5leR80T3fGn58ea'),
('e67174ed-e76f-412e-aebf-2e35b71add80', 'Admin', 'admin@compumacy.com', 'https://taskara.compumacy.com/api/uploads/avatars/cc4eec18-9508-4e71-b878-ce3f12008398.png', 'A', 'admin', 'Active', '$2a$10$/BqvRkMicMQoDIHhST.bZec2sv4Nt24AQv0g7/IG3dX3ScgXTWaEa'),
('e9f05589-b1ef-43d7-a786-980d3781a9db', 'Mohammed Fouda', 'fouda@compumacy.com', NULL, 'MF', 'user', 'Inactive', NULL),
('ec723edd-d5bb-4877-a80e-a13a7a35db16', 'Mohamed Essawey', 'mohamed.essawey@compumacy.com', '', 'ME', 'user', 'Inactive', '$2a$10$AMEPefKW5O5i8H8YCq33WuPsw7npqT.DIOdiiKA6jpkL.deAzGxb.'),
('system-deleted-user', 'Deleted User', 'deleted@system.local', NULL, 'DU', 'user', 'Inactive', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `user_id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_notifications` tinyint(1) NOT NULL DEFAULT '1',
  `push_notifications` tinyint(1) NOT NULL DEFAULT '0',
  `task_reminders` tinyint(1) NOT NULL DEFAULT '1',
  `project_updates` tinyint(1) NOT NULL DEFAULT '1',
  `timezone` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UTC',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `meeting_reminders` tinyint(1) NOT NULL DEFAULT '1',
  `meeting_updates` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attachments_uploaded_by_id_users_id_fk` (`uploaded_by_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comments_user_id_users_id_fk` (`user_id`),
  ADD KEY `idx_comments_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `communities`
--
ALTER TABLE `communities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_visibility` (`visibility`),
  ADD KEY `idx_archived` (`is_archived`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `community_activity`
--
ALTER TABLE `community_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_community` (`community_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_target` (`target_type`,`target_id`),
  ADD KEY `idx_created` (`created_at` DESC),
  ADD KEY `idx_activity_community_created` (`community_id`,`created_at` DESC);

--
-- Indexes for table `community_categories`
--
ALTER TABLE `community_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_community` (`community_id`),
  ADD KEY `idx_parent` (`parent_category_id`),
  ADD KEY `idx_order` (`display_order`);

--
-- Indexes for table `community_comments`
--
ALTER TABLE `community_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post` (`post_id`),
  ADD KEY `idx_author` (`author_id`),
  ADD KEY `idx_parent` (`parent_comment_id`),
  ADD KEY `idx_created` (`created_at`),
  ADD KEY `idx_comments_post_created` (`post_id`,`created_at`),
  ADD KEY `idx_comments_post` (`post_id`,`is_deleted`),
  ADD KEY `idx_comments_author` (`author_id`);

--
-- Indexes for table `community_files`
--
ALTER TABLE `community_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_community` (`community_id`),
  ADD KEY `idx_post` (`post_id`),
  ADD KEY `idx_uploader` (`uploaded_by`),
  ADD KEY `idx_type` (`file_type`),
  ADD KEY `idx_uploaded` (`uploaded_at` DESC),
  ADD KEY `idx_files_community_uploaded` (`community_id`,`uploaded_at` DESC),
  ADD KEY `idx_files_community` (`community_id`),
  ADD KEY `idx_files_uploader` (`uploaded_by`);

--
-- Indexes for table `community_members`
--
ALTER TABLE `community_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_member` (`community_id`,`user_id`),
  ADD KEY `idx_community` (`community_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_joined` (`joined_at`);

--
-- Indexes for table `community_posts`
--
ALTER TABLE `community_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_community` (`community_id`),
  ADD KEY `idx_author` (`author_id`),
  ADD KEY `idx_created` (`created_at` DESC),
  ADD KEY `idx_pinned` (`is_pinned`),
  ADD KEY `idx_featured` (`is_featured`),
  ADD KEY `idx_draft` (`is_draft`),
  ADD KEY `idx_parent` (`parent_post_id`),
  ADD KEY `idx_category` (`category_id`),
  ADD KEY `idx_posts_community_created` (`community_id`,`created_at` DESC),
  ADD KEY `idx_posts_author_created` (`author_id`,`created_at` DESC),
  ADD KEY `idx_posts_community` (`community_id`,`is_deleted`,`is_draft`,`is_approved`),
  ADD KEY `idx_posts_author` (`author_id`),
  ADD KEY `idx_posts_pinned` (`is_pinned`,`created_at`);

--
-- Indexes for table `community_reactions`
--
ALTER TABLE `community_reactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_post_reaction` (`post_id`,`user_id`,`reaction_type`),
  ADD KEY `idx_post_reactions` (`post_id`),
  ADD KEY `idx_user_reactions` (`user_id`),
  ADD KEY `idx_reaction_type` (`reaction_type`);

--
-- Indexes for table `community_vault`
--
ALTER TABLE `community_vault`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_community` (`community_id`),
  ADD KEY `idx_type` (`item_type`),
  ADD KEY `idx_creator` (`created_by`),
  ADD KEY `idx_expires` (`expires_at`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `community_vault_access_log`
--
ALTER TABLE `community_vault_access_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_vault_item` (`vault_item_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_accessed` (`accessed_at` DESC),
  ADD KEY `idx_action` (`action`);

--
-- Indexes for table `community_voice_notes`
--
ALTER TABLE `community_voice_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post` (`post_id`),
  ADD KEY `idx_comment` (`comment_id`),
  ADD KEY `idx_creator` (`created_by`),
  ADD KEY `idx_status` (`transcription_status`);

--
-- Indexes for table `meetings`
--
ALTER TABLE `meetings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_meetings_start_time` (`start_time`),
  ADD KEY `idx_meetings_status` (`status`),
  ADD KEY `idx_meetings_created_by` (`created_by_id`),
  ADD KEY `idx_meetings_project` (`project_id`);

--
-- Indexes for table `meeting_attendees`
--
ALTER TABLE `meeting_attendees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_meeting_attendees_meeting` (`meeting_id`),
  ADD KEY `idx_meeting_attendees_user` (`user_id`),
  ADD KEY `idx_meeting_attendees_status` (`status`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_id` (`user_id`),
  ADD KEY `idx_notifications_user_read` (`user_id`,`read`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_projects_owner_id` (`owner_id`);

--
-- Indexes for table `project_documents`
--
ALTER TABLE `project_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_documents_project_id` (`project_id`),
  ADD KEY `idx_project_documents_uploaded_by` (`uploaded_by_id`),
  ADD KEY `idx_project_documents_uploaded_at` (`uploaded_at`);

--
-- Indexes for table `project_notes`
--
ALTER TABLE `project_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_notes_project_id` (`project_id`),
  ADD KEY `idx_project_notes_created_by` (`created_by_id`),
  ADD KEY `idx_project_notes_pinned` (`is_pinned`),
  ADD KEY `idx_project_notes_created_at` (`created_at`);

--
-- Indexes for table `project_tags`
--
ALTER TABLE `project_tags`
  ADD PRIMARY KEY (`project_id`,`tag`);

--
-- Indexes for table `project_team`
--
ALTER TABLE `project_team`
  ADD PRIMARY KEY (`project_id`,`user_id`),
  ADD KEY `idx_project_team_project_id` (`project_id`),
  ADD KEY `idx_project_team_user_id` (`user_id`);

--
-- Indexes for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `push_subscriptions_user_id_users_id_fk` (`user_id`);

--
-- Indexes for table `questionnaires`
--
ALTER TABLE `questionnaires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_questionnaires_created_by` (`created_by_id`),
  ADD KEY `idx_questionnaires_status` (`status`),
  ADD KEY `idx_questionnaires_deadline` (`deadline`);

--
-- Indexes for table `questionnaire_answers`
--
ALTER TABLE `questionnaire_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_answers_response` (`response_id`),
  ADD KEY `idx_answers_question` (`question_id`);

--
-- Indexes for table `questionnaire_feedback`
--
ALTER TABLE `questionnaire_feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `from_user_id` (`from_user_id`),
  ADD KEY `idx_feedback_response` (`response_id`),
  ADD KEY `idx_feedback_critical` (`is_critical`);

--
-- Indexes for table `questionnaire_history`
--
ALTER TABLE `questionnaire_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_history_questionnaire` (`questionnaire_id`),
  ADD KEY `idx_history_response` (`response_id`);

--
-- Indexes for table `questionnaire_questions`
--
ALTER TABLE `questionnaire_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_questions_questionnaire` (`questionnaire_id`),
  ADD KEY `idx_questions_order` (`display_order`);

--
-- Indexes for table `questionnaire_responses`
--
ALTER TABLE `questionnaire_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_response` (`questionnaire_id`,`user_id`),
  ADD KEY `reviewed_by_id` (`reviewed_by_id`),
  ADD KEY `idx_responses_questionnaire` (`questionnaire_id`),
  ADD KEY `idx_responses_user` (`user_id`),
  ADD KEY `idx_responses_status` (`status`);

--
-- Indexes for table `questionnaire_targets`
--
ALTER TABLE `questionnaire_targets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_targets_questionnaire` (`questionnaire_id`),
  ADD KEY `idx_targets_user` (`user_id`);

--
-- Indexes for table `subtasks`
--
ALTER TABLE `subtasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subtasks_assignee_id_users_id_fk` (`assignee_id`),
  ADD KEY `idx_subtasks_task_id` (`task_id`);

--
-- Indexes for table `subtask_assignees`
--
ALTER TABLE `subtask_assignees`
  ADD PRIMARY KEY (`subtask_id`,`user_id`),
  ADD KEY `idx_subtask_assignees_subtask` (`subtask_id`),
  ADD KEY `idx_subtask_assignees_user` (`user_id`);

--
-- Indexes for table `subtask_tags`
--
ALTER TABLE `subtask_tags`
  ADD PRIMARY KEY (`subtask_id`,`tag`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tasks_approved_by_id_users_id_fk` (`approved_by_id`),
  ADD KEY `idx_tasks_project_id` (`project_id`),
  ADD KEY `idx_tasks_created_by` (`created_by_id`),
  ADD KEY `idx_tasks_approval_status` (`approval_status`);

--
-- Indexes for table `task_assignees`
--
ALTER TABLE `task_assignees`
  ADD PRIMARY KEY (`task_id`,`user_id`),
  ADD KEY `idx_task_assignees_user_id` (`user_id`),
  ADD KEY `idx_task_assignees_task_id` (`task_id`);

--
-- Indexes for table `task_tags`
--
ALTER TABLE `task_tags`
  ADD PRIMARY KEY (`task_id`,`tag`);

--
-- Indexes for table `timesheets`
--
ALTER TABLE `timesheets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timesheets_user_id_users_id_fk` (`user_id`),
  ADD KEY `timesheets_approved_by_id_users_id_fk` (`approved_by_id`);

--
-- Indexes for table `timesheet_entries`
--
ALTER TABLE `timesheet_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timesheet_entries_timesheet_id_timesheets_id_fk` (`timesheet_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`user_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_uploaded_by_id_users_id_fk` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `project_tags`
--
ALTER TABLE `project_tags`
  ADD CONSTRAINT `project_tags_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `project_team`
--
ALTER TABLE `project_team`
  ADD CONSTRAINT `project_team_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  ADD CONSTRAINT `project_team_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD CONSTRAINT `push_subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `subtasks`
--
ALTER TABLE `subtasks`
  ADD CONSTRAINT `subtasks_assignee_id_users_id_fk` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `subtasks_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`);

--
-- Constraints for table `subtask_tags`
--
ALTER TABLE `subtask_tags`
  ADD CONSTRAINT `subtask_tags_subtask_id_subtasks_id_fk` FOREIGN KEY (`subtask_id`) REFERENCES `subtasks` (`id`);

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_approved_by_id_users_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `tasks_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `tasks_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `task_assignees`
--
ALTER TABLE `task_assignees`
  ADD CONSTRAINT `task_assignees_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`),
  ADD CONSTRAINT `task_assignees_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `task_tags`
--
ALTER TABLE `task_tags`
  ADD CONSTRAINT `task_tags_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`);

--
-- Constraints for table `timesheets`
--
ALTER TABLE `timesheets`
  ADD CONSTRAINT `timesheets_approved_by_id_users_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `timesheets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `timesheet_entries`
--
ALTER TABLE `timesheet_entries`
  ADD CONSTRAINT `timesheet_entries_timesheet_id_timesheets_id_fk` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets` (`id`);

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
