-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 01, 2025 at 04:51 PM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u744630877_tasks`
--

-- --------------------------------------------------------

--
-- Table structure for table `attachments`
--

CREATE TABLE `attachments` (
  `id` varchar(191) NOT NULL,
  `name` varchar(500) NOT NULL,
  `size` varchar(50) NOT NULL,
  `url` text NOT NULL,
  `type` varchar(100) NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp(),
  `uploaded_by_id` varchar(191) NOT NULL,
  `uploaded_by_name` varchar(255) NOT NULL,
  `entity_type` varchar(16) NOT NULL,
  `entity_id` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attachments`
--

INSERT INTO `attachments` (`id`, `name`, `size`, `url`, `type`, `uploaded_at`, `uploaded_by_id`, `uploaded_by_name`, `entity_type`, `entity_id`) VALUES
('7667b721-7716-431b-acff-cc490994ddc3', 'Financial-Statement-30-Jun-2025-Consolidated (1).pdf', '0.8 MB', 'http://localhost:3000/uploads/attachments/f56f998a-4fca-404f-8126-93a95e9493ac.pdf', 'application/pdf', '2025-10-01 15:23:31', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'test user', 'task', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` varchar(191) NOT NULL,
  `entity_type` varchar(16) NOT NULL,
  `entity_id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `avatar` text DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `entity_type`, `entity_id`, `user_id`, `user_name`, `avatar`, `content`, `created_at`, `updated_at`) VALUES
('0775be88-19e2-47cc-8145-227c808f5f01', 'subtask', '0b8d94c6-7f9f-44f5-87ed-9da3abd9eee5', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'TEST TEST', '2025-10-01 02:35:56', '2025-10-01 02:35:56'),
('10cb0bc8-4e95-492a-ba74-e9747768998e', 'subtask', 'subtask-1759286170249', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'CD', '2025-10-01 02:36:24', '2025-10-01 02:36:24'),
('58e759cc-117a-4ec8-ac1c-3c5971028316', 'task', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'DEDWE', '2025-10-01 02:45:22', '2025-10-01 02:45:22'),
('849d6962-e00b-4f0b-ad65-72e6e87ce69f', 'task', '582b9106-e20f-40cb-a932-68dddc0e6c20', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'TEST COMMENT - 1', '2025-10-01 02:22:58', '2025-10-01 02:22:58'),
('84b043f2-3768-4e48-a79b-8a1c0c281d9a', 'task', '582b9106-e20f-40cb-a932-68dddc0e6c20', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'TEST - 3', '2025-10-01 02:29:59', '2025-10-01 02:29:59'),
('b89e01a5-e14d-461e-9f6c-42fc4e693b2b', 'task', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'test user', NULL, 'dewdwe', '2025-10-01 15:33:33', '2025-10-01 15:33:33'),
('d228fa2b-48e5-4f9a-80c3-fb67c2f1d46b', 'task', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'test user', NULL, 'grtgrt', '2025-10-01 15:00:32', '2025-10-01 15:00:32'),
('d455591c-3f8f-4b97-b06f-5f40786deeb5', 'task', '582b9106-e20f-40cb-a932-68dddc0e6c20', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'TEST COMMENT - 2', '2025-10-01 02:24:15', '2025-10-01 02:24:15');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(191) NOT NULL,
  `type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `user_id` varchar(191) NOT NULL,
  `related_id` varchar(191) DEFAULT NULL,
  `related_type` varchar(16) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `read`, `created_at`, `user_id`, `related_id`, `related_type`) VALUES
('0bfc0052-cdc6-4d9b-ace7-95a8530ed56f', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', '4615849c-299d-40cf-8532-6637d89d04bd', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('1266ca38-5d27-4d5e-9a20-38964571f565', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:53', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('16c1e760-4343-4690-946a-d4a3d827e9eb', 'task_rejected', 'test', 'Your task has been rejected.', 1, '2025-10-01 15:44:34', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('1add7b73-1202-480b-828b-d29f3b562a7f', 'timesheet_submitted', 'Timesheet submitted', 'A timesheet for 2025-10 has been submitted', 1, '2025-10-01 15:13:09', '4615849c-299d-40cf-8532-6637d89d04bd', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('1f38f07f-cb1a-4df9-b596-31f0271bd52e', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('2cb5393f-4281-4b29-8375-29b818fd4d5e', 'task_commented', 'FREFRE', 'Admin User commented on a task.', 0, '2025-10-01 02:45:22', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'task'),
('42e11a5e-4987-451f-a208-215f6433ae84', 'task_approved', 'FREFRE', 'Your task has been approved.', 1, '2025-10-01 02:43:43', '4615849c-299d-40cf-8532-6637d89d04bd', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'task'),
('460a757a-287a-4e7a-937d-a891b61af8fc', 'task_approved', 'TEST TASK -- 2', 'Your task has been approved.', 1, '2025-10-01 02:22:16', '4615849c-299d-40cf-8532-6637d89d04bd', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('6b8f7714-a37a-4387-a59f-cca67cb6457f', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 0, '2025-10-01 02:29:59', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('70a323a1-cfea-4082-9ed0-0039f92018fd', 'project_updated', 'Project updated: test project - 1', 'Project details have been updated.', 1, '2025-10-01 02:19:11', '4615849c-299d-40cf-8532-6637d89d04bd', '75841349-2407-498c-a049-7b87720f5853', 'project'),
('7668f456-3299-4f8d-8b16-29d9fab7de17', 'admin_task_rejected', 'test', 'Task \"test\" has been rejected.', 1, '2025-10-01 15:44:35', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('80710ecc-52aa-460d-87d9-caeddaaba71c', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('835c8e4c-cd6b-44a4-9b74-fcc744289481', 'project_updated', 'Project updated: test project - 1', 'Project details have been updated.', 0, '2025-10-01 02:19:11', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '75841349-2407-498c-a049-7b87720f5853', 'project'),
('8baf32c7-562c-4bd8-9750-2b486a4a4721', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('9be6f991-b0e3-4f00-84bd-8a27562ed3b3', 'task_pending', 'test', 'Your task is pending approval.', 1, '2025-10-01 15:00:03', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('9e8eb0c4-48dc-4b90-b121-4d09dbf7e26c', 'task_approved', 'task - 4', 'Your task has been approved.', 1, '2025-10-01 02:20:20', '4615849c-299d-40cf-8532-6637d89d04bd', 'f1b34881-eda9-4231-a34a-40efa5322ab6', 'task'),
('a1f67e54-b644-43c6-bd0e-c834be8c3ee8', 'timesheet_approved', 'Timesheet approved', 'Your 2025-10 timesheet was approved', 1, '2025-10-01 15:13:41', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('a2dca259-907d-4297-a991-19b7559ade3b', 'timesheet_returned', 'Timesheet returned', 'Your 2025-10 timesheet was returned: ttt', 1, '2025-10-01 15:12:26', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('b9bf179a-7d9a-43b6-99c3-e79162857c8f', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 0, '2025-10-01 02:22:59', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('c0c8d868-4b0f-41d3-a2c6-2acb7987d2a2', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('c16cb553-ca10-4acf-a688-67d9ae42488e', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', '4615849c-299d-40cf-8532-6637d89d04bd', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('c1d22150-bf86-4177-b01e-81bf17ee89a1', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a subtask.', 0, '2025-10-01 02:35:56', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('c5f1b734-e9dd-4a6e-ba32-3cce184f7348', 'task_delete_request', 'Delete request for: test', 'test user has requested to delete the task \"test\".', 1, '2025-10-01 15:03:19', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('c7e22ec7-0116-4647-a475-29a4b84c5451', 'task_assigned', 'test', 'You were assigned to a task.', 0, '2025-10-01 15:38:54', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('d366c917-5e33-4117-8120-8ab4fcfb374e', 'task_approved', 'DEDED', 'Your task has been approved.', 1, '2025-10-01 02:47:23', '4615849c-299d-40cf-8532-6637d89d04bd', '392c1f73-100d-40ed-8663-4c69a54cd8b1', 'task'),
('d7b6363f-309f-4e84-8c16-5cc98e50131b', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 0, '2025-10-01 02:24:16', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('e458160f-cc79-41ef-915b-2e5484dcf8c7', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:54', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('e8e405ac-759c-42fc-a5d2-d4ff4ce2f884', 'task_pending_review', 'test', 'test is awaiting approval.', 1, '2025-10-01 15:00:04', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('ea866e3b-3a16-4292-af88-871fdf0ef3e5', 'task_commented', 'test', 'test user commented on a task.', 1, '2025-10-01 15:33:33', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('f07996e3-7158-4623-a510-effccdf4838b', 'task_commented', 'test', 'test user commented on a task.', 1, '2025-10-01 15:00:33', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('fc2491e7-969f-4f51-8524-2d87f2e2400f', 'timesheet_submitted', 'Timesheet submitted', 'A timesheet for 2025-10 has been submitted', 1, '2025-10-01 15:09:02', '4615849c-299d-40cf-8532-6637d89d04bd', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(191) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(16) NOT NULL,
  `priority` varchar(8) NOT NULL,
  `start_date` datetime NOT NULL,
  `due_date` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `progress` int(11) NOT NULL,
  `owner_id` varchar(191) NOT NULL,
  `color` varchar(50) NOT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `estimated_hours` decimal(10,2) DEFAULT NULL,
  `actual_hours` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `name`, `description`, `status`, `priority`, `start_date`, `due_date`, `created_at`, `updated_at`, `completed_at`, `progress`, `owner_id`, `color`, `budget`, `estimated_hours`, `actual_hours`) VALUES
('75841349-2407-498c-a049-7b87720f5853', 'test project - 999', 'test project - 1', 'planning', 'medium', '2025-10-28 00:00:00', '2025-10-30 00:00:00', '2025-10-01 02:06:39', '2025-10-01 02:52:48', NULL, 67, '4615849c-299d-40cf-8532-6637d89d04bd', 'amber', NULL, NULL, NULL),
('b14b6764-36fb-44d4-8eae-809a447d8bf0', 'test project - 2 (Copy)', 'test project - 2', 'planning', 'low', '2025-10-26 00:00:00', '2025-10-28 00:00:00', '2025-10-01 02:53:23', '2025-10-01 15:44:32', NULL, 50, 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'violet', NULL, NULL, NULL),
('e947d6b8-cd76-4434-b8fb-4adcee35287e', 'test project - 2', 'test project - 2', 'planning', 'low', '2025-10-18 00:00:00', '2025-10-21 00:00:00', '2025-10-01 02:08:16', '2025-10-01 15:30:39', NULL, 0, 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'violet', 4444.00, 444.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_tags`
--

CREATE TABLE `project_tags` (
  `project_id` varchar(191) NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_tags`
--

INSERT INTO `project_tags` (`project_id`, `tag`) VALUES
('75841349-2407-498c-a049-7b87720f5853', 'test project - 1'),
('b14b6764-36fb-44d4-8eae-809a447d8bf0', 'test project - 2'),
('e947d6b8-cd76-4434-b8fb-4adcee35287e', 'test project - 2');

-- --------------------------------------------------------

--
-- Table structure for table `project_team`
--

CREATE TABLE `project_team` (
  `project_id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_team`
--

INSERT INTO `project_team` (`project_id`, `user_id`) VALUES
('75841349-2407-498c-a049-7b87720f5853', '4615849c-299d-40cf-8532-6637d89d04bd'),
('75841349-2407-498c-a049-7b87720f5853', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('e947d6b8-cd76-4434-b8fb-4adcee35287e', '4615849c-299d-40cf-8532-6637d89d04bd'),
('e947d6b8-cd76-4434-b8fb-4adcee35287e', 'bc0eb545-5376-497c-9649-42cb8cb594e1'),
('e947d6b8-cd76-4434-b8fb-4adcee35287e', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600');

-- --------------------------------------------------------

--
-- Table structure for table `push_subscriptions`
--

CREATE TABLE `push_subscriptions` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `endpoint` text NOT NULL,
  `p256dh` text NOT NULL,
  `auth` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subtasks`
--

CREATE TABLE `subtasks` (
  `id` varchar(191) NOT NULL,
  `task_id` varchar(191) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'todo',
  `completed` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` datetime DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `assignee_id` varchar(191) DEFAULT NULL,
  `priority` varchar(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subtasks`
--

INSERT INTO `subtasks` (`id`, `task_id`, `title`, `description`, `status`, `completed`, `start_date`, `due_date`, `created_at`, `updated_at`, `assignee_id`, `priority`) VALUES
('0b8d94c6-7f9f-44f5-87ed-9da3abd9eee5', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'TEST SUB TASK GTGT', '', 'review', 1, NULL, '2025-10-04 00:00:00', '2025-10-01 02:35:30', '2025-10-01 02:41:32', NULL, NULL),
('39077987-2e7a-42e9-b2c1-8786902e397b', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'DEWDWEEW', '', 'done', 1, NULL, '2025-10-09 00:00:00', '2025-10-01 02:41:21', '2025-10-01 02:41:53', NULL, NULL),
('a6d88627-ee57-41a9-9c5d-9a77120be676', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'ferfre (Copy)', '', 'todo', 0, NULL, '2025-10-29 00:00:00', '2025-10-01 15:03:02', '2025-10-01 15:03:02', NULL, NULL),
('b5253438-0a19-422e-ab7c-8d90017b79ff', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'TEST SUB TASK', '', 'review', 1, NULL, '2025-10-30 00:00:00', '2025-10-01 02:35:30', '2025-10-01 02:52:47', NULL, NULL),
('b54b8aef-8f82-4b8f-b150-1e8ea334cc7f', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'ferfre', '', 'review', 1, NULL, '2025-10-29 00:00:00', '2025-10-01 15:00:41', '2025-10-01 15:35:54', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subtask_tags`
--

CREATE TABLE `subtask_tags` (
  `subtask_id` varchar(191) NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(191) NOT NULL,
  `project_id` varchar(191) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(16) NOT NULL,
  `priority` varchar(8) NOT NULL,
  `start_date` datetime NOT NULL,
  `due_date` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_by_id` varchar(191) NOT NULL,
  `approval_status` varchar(16) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by_id` varchar(191) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `progress` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `project_id`, `title`, `description`, `status`, `priority`, `start_date`, `due_date`, `created_at`, `updated_at`, `completed_at`, `created_by_id`, `approval_status`, `approved_at`, `approved_by_id`, `rejection_reason`, `progress`) VALUES
('392c1f73-100d-40ed-8663-4c69a54cd8b1', '75841349-2407-498c-a049-7b87720f5853', 'DEDED', 'DEWDWE\n\nTime: 08:47 - 10:47\nType: task', 'done', 'medium', '2025-10-22 00:00:00', '2025-10-22 00:00:00', '2025-10-01 02:47:22', '2025-10-01 02:52:09', '2025-10-01 02:52:09', '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 100),
('582b9106-e20f-40cb-a932-68dddc0e6c20', '75841349-2407-498c-a049-7b87720f5853', 'TEST TASK -- 2', 'TEST TASK -- 2', 'done', 'medium', '2025-11-14 00:00:00', '2025-11-27 00:00:00', '2025-10-01 02:22:15', '2025-10-01 02:52:48', '2025-10-01 02:52:28', '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 100),
('d2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'FREFRE', 'FREFERFER', 'todo', 'medium', '2025-10-01 02:43:42', '2025-10-31 00:00:00', '2025-10-01 02:43:42', '2025-10-01 02:43:42', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 0),
('d9579f08-2d7f-4c87-baa2-ada8f82b9172', 'b14b6764-36fb-44d4-8eae-809a447d8bf0', 'test', 'test', 'done', 'high', '2025-10-01 15:00:02', '2025-10-21 00:00:00', '2025-10-01 15:00:02', '2025-10-01 15:44:32', '2025-10-01 15:39:04', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'rejected', NULL, NULL, '', 50),
('f1b34881-eda9-4231-a34a-40efa5322ab6', '75841349-2407-498c-a049-7b87720f5853', 'task - 4', 'task - 4', 'todo', 'medium', '2025-10-22 00:00:00', '2025-10-30 00:00:00', '2025-10-01 02:20:19', '2025-10-01 02:20:19', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `task_assignees`
--

CREATE TABLE `task_assignees` (
  `task_id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_assignees`
--

INSERT INTO `task_assignees` (`task_id`, `user_id`) VALUES
('392c1f73-100d-40ed-8663-4c69a54cd8b1', '4615849c-299d-40cf-8532-6637d89d04bd'),
('582b9106-e20f-40cb-a932-68dddc0e6c20', '4615849c-299d-40cf-8532-6637d89d04bd'),
('d2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', '4615849c-299d-40cf-8532-6637d89d04bd'),
('d9579f08-2d7f-4c87-baa2-ada8f82b9172', '4615849c-299d-40cf-8532-6637d89d04bd'),
('f1b34881-eda9-4231-a34a-40efa5322ab6', '4615849c-299d-40cf-8532-6637d89d04bd'),
('d9579f08-2d7f-4c87-baa2-ada8f82b9172', 'bc0eb545-5376-497c-9649-42cb8cb594e1'),
('392c1f73-100d-40ed-8663-4c69a54cd8b1', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('582b9106-e20f-40cb-a932-68dddc0e6c20', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('d2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('d9579f08-2d7f-4c87-baa2-ada8f82b9172', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('f1b34881-eda9-4231-a34a-40efa5322ab6', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600');

-- --------------------------------------------------------

--
-- Table structure for table `task_tags`
--

CREATE TABLE `task_tags` (
  `task_id` varchar(191) NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_tags`
--

INSERT INTO `task_tags` (`task_id`, `tag`) VALUES
('392c1f73-100d-40ed-8663-4c69a54cd8b1', 'task'),
('582b9106-e20f-40cb-a932-68dddc0e6c20', 'TEST TASLKS'),
('d2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'SWS');

-- --------------------------------------------------------

--
-- Table structure for table `timesheets`
--

CREATE TABLE `timesheets` (
  `id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `month` varchar(7) NOT NULL,
  `status` varchar(16) NOT NULL DEFAULT 'draft',
  `submitted_at` datetime DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by_id` varchar(191) DEFAULT NULL,
  `returned_at` datetime DEFAULT NULL,
  `return_comments` text DEFAULT NULL,
  `rejected_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timesheets`
--

INSERT INTO `timesheets` (`id`, `user_id`, `month`, `status`, `submitted_at`, `approved_at`, `approved_by_id`, `returned_at`, `return_comments`, `rejected_at`, `created_at`, `updated_at`) VALUES
('65d877ce-49c0-47d5-9f69-5852f9b03ae2', 'bc0eb545-5376-497c-9649-42cb8cb594e1', '2025-11', 'draft', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-01 15:08:35', NULL),
('a601b413-2251-44c4-9c99-7069ac28b595', 'bc0eb545-5376-497c-9649-42cb8cb594e1', '2025-10', 'approved', '2025-10-01 15:13:09', '2025-10-01 15:13:41', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-01 15:12:26', 'ttt', NULL, '2025-10-01 15:08:41', '2025-10-01 15:08:55');

-- --------------------------------------------------------

--
-- Table structure for table `timesheet_entries`
--

CREATE TABLE `timesheet_entries` (
  `id` varchar(191) NOT NULL,
  `timesheet_id` varchar(191) NOT NULL,
  `date` varchar(10) NOT NULL,
  `hours` decimal(5,2) NOT NULL DEFAULT 0.00,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timesheet_entries`
--

INSERT INTO `timesheet_entries` (`id`, `timesheet_id`, `date`, `hours`, `note`) VALUES
('07413ec7-4fab-4702-be2b-30b9d723abe9', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-20', 0.00, NULL),
('0790aecb-c934-42da-8d45-000b8c043dd3', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-02', 0.00, NULL),
('0b004fd9-8515-4abb-ac47-dedeedbb5392', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-13', 0.00, NULL),
('0c328bdd-5a64-4b4d-80d6-b85fd4068366', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-28', 0.00, NULL),
('0ec50efd-7987-4156-b258-fee018aaa188', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-05', 0.00, NULL),
('0ec9327c-7f60-43f1-b54e-0264d3db65b1', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-01', 8.00, NULL),
('187a8d4d-978a-498e-9a3c-4f1ab0580e3a', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-09', 0.00, NULL),
('1e7d292c-289a-4d8b-ab6b-fc19cb89aeaf', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-07', 0.00, NULL),
('1f0a7fba-89a9-4350-aa59-e0b8225b1873', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-11', 0.00, NULL),
('20225f6e-edab-497e-a6ec-85e546bbc508', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-19', 0.00, NULL),
('29f2b3ad-fc28-4604-8bbe-dc476c54bec3', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-29', 0.00, NULL),
('2e4ab6c9-9d31-4414-99ef-74bb91098069', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-22', 0.00, NULL),
('3004f1c8-6226-416e-9182-73b67f3f0bab', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-08', 0.00, NULL),
('3eddc5d3-19e6-48cf-b706-6b868fe33b77', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-31', 0.00, NULL),
('4e2136a4-e4e4-45e0-a921-529fcdb6e97b', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-25', 0.00, NULL),
('4ff2e8b7-d0f1-43bd-8eb4-63461d677b7f', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-27', 0.00, NULL),
('50d3bf1f-c0b5-43ff-ba24-a06d056c8492', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-16', 0.00, NULL),
('5b658cea-81dc-4225-8ec1-2bbbfc2c7c71', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-30', 0.00, NULL),
('6073000c-f37d-4b1d-a7a6-912dcfe1b523', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-14', 0.00, NULL),
('75116daa-f940-4fb9-91de-782b62fdd42e', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-23', 0.00, NULL),
('77611627-0090-4b99-823a-1e2610be0925', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-26', 0.00, NULL),
('90a33261-fe1c-4f4a-b94b-fd32f6478123', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-06', 0.00, NULL),
('99e70ae8-e7d1-48b4-a2bf-3c60e3bc4f3a', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-24', 0.00, NULL),
('9de1a2ae-db25-4f27-8966-bec85ae05222', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-15', 0.00, NULL),
('ad8e78f6-03b8-41fa-91ab-37d00ba3bf8f', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-18', 0.00, NULL),
('afdee124-59d7-4d09-b9e5-0bc53f19328b', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-17', 0.00, NULL),
('b5a53ce4-799f-462d-b50d-83d5c00d7441', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-03', 0.00, NULL),
('b7b8dd62-d2bf-4ea4-adf6-ae7e6b99dced', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-04', 0.00, NULL),
('c1b61b51-4441-4230-8467-f544f7b10bfa', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-12', 0.00, NULL),
('c7dc38da-6d16-449a-a6fa-e65c33ea3de8', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-21', 0.00, NULL),
('e5711ed0-f96a-4f27-a4ed-2c8d4fc6ca63', 'a601b413-2251-44c4-9c99-7069ac28b595', '2025-10-10', 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `avatar` text DEFAULT NULL,
  `initials` varchar(10) NOT NULL,
  `role` varchar(16) NOT NULL,
  `status` varchar(16) DEFAULT NULL,
  `password_hash` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `avatar`, `initials`, `role`, `status`, `password_hash`) VALUES
('4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', 'admin@taskara.com', 'http://localhost:3000/uploads/avatars/4a8f1fa1-c8b1-4620-ab5c-42969fe30153.jpg', 'AU', 'admin', NULL, '$2a$10$/Bj31tDl9f7XdQgdrOE3FeAdRQtRV2jQY5ojwVTtsZw.hiVNzru2S'),
('bc0eb545-5376-497c-9649-42cb8cb594e1', 'test user', 'abdullah@gmail.com', NULL, 'TU', 'user', 'Inactive', '$2a$10$Xw0c4TExBMW2z2R3jXpwZ.DStPp.mqy5hu0ANbOmwTAQvUNBphZXy'),
('d9958d50-dcb2-4cd1-b2b0-155d62e86600', 'Regular User', 'user@taskara.com', '/placeholder-user.jpg', 'RU', 'user', NULL, '$2a$10$iNIZeIQoYCzra1FsU3svbuNHfS7QlTrfjXZpWuOGYfWO1DyT8wOdm');

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `user_id` varchar(191) NOT NULL,
  `email_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `push_notifications` tinyint(1) NOT NULL DEFAULT 0,
  `task_reminders` tinyint(1) NOT NULL DEFAULT 1,
  `project_updates` tinyint(1) NOT NULL DEFAULT 1,
  `timezone` varchar(100) NOT NULL DEFAULT 'UTC',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
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
-- Indexes for table `subtasks`
--
ALTER TABLE `subtasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subtasks_assignee_id_users_id_fk` (`assignee_id`),
  ADD KEY `idx_subtasks_task_id` (`task_id`);

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
  ADD CONSTRAINT `attachments_uploaded_by_id_users_id_fk` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_owner_id_users_id_fk` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `project_tags`
--
ALTER TABLE `project_tags`
  ADD CONSTRAINT `project_tags_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `project_team`
--
ALTER TABLE `project_team`
  ADD CONSTRAINT `project_team_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `project_team_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD CONSTRAINT `push_subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `subtasks`
--
ALTER TABLE `subtasks`
  ADD CONSTRAINT `subtasks_assignee_id_users_id_fk` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `subtasks_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `subtask_tags`
--
ALTER TABLE `subtask_tags`
  ADD CONSTRAINT `subtask_tags_subtask_id_subtasks_id_fk` FOREIGN KEY (`subtask_id`) REFERENCES `subtasks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_approved_by_id_users_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `tasks_created_by_id_users_id_fk` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `tasks_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `task_assignees`
--
ALTER TABLE `task_assignees`
  ADD CONSTRAINT `task_assignees_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `task_assignees_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `task_tags`
--
ALTER TABLE `task_tags`
  ADD CONSTRAINT `task_tags_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `timesheets`
--
ALTER TABLE `timesheets`
  ADD CONSTRAINT `timesheets_approved_by_id_users_id_fk` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `timesheets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `timesheet_entries`
--
ALTER TABLE `timesheet_entries`
  ADD CONSTRAINT `timesheet_entries_timesheet_id_timesheets_id_fk` FOREIGN KEY (`timesheet_id`) REFERENCES `timesheets` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
