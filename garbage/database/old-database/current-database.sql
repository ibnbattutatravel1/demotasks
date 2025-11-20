-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 25, 2025 at 02:05 AM
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
('4b03d457-60cd-404d-b2f9-d0f754296477', '4d608bfe-2c91-4045-8456-7f046971aa33.png', '2.4 MB', 'https://taskara.compumacy.com/api/uploads/attachments/9dab691e-8f01-41b0-8986-b18de254bb45.png', 'image/png', '2025-10-25 00:00:06', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', 'task', 'e6c64cd3-02e6-4a99-b9a4-a869517d4499'),
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
('23b08b6c-568b-46f1-a4d4-d76543d6074c', 'task', '1360282c-2a47-4ec3-9bda-927707739c37', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', 'http://localhost:3000/uploads/avatars/4a8f1fa1-c8b1-4620-ab5c-42969fe30153.jpg', '@fghuik,', '2025-10-05 17:50:36', '2025-10-05 17:50:36'),
('2b607c46-03e8-483a-bb3e-e15d2a04e0b7', 'task', '392c1f73-100d-40ed-8663-4c69a54cd8b1', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'Regular User', '/placeholder-user.jpg', 'yguguy', '2025-10-23 22:20:48', '2025-10-23 22:20:48'),
('3be076c2-2ff3-4c6e-8b5f-276c05e72bda', 'task', '1360282c-2a47-4ec3-9bda-927707739c37', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', 'http://localhost:3000/uploads/avatars/4a8f1fa1-c8b1-4620-ab5c-42969fe30153.jpg', 'gtdfgdfgdfg', '2025-10-20 22:06:51', '2025-10-20 22:06:51'),
('3f7ed7cc-d00e-4f85-aafa-e68e09e840b4', 'task', '1360282c-2a47-4ec3-9bda-927707739c37', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', 'http://localhost:3000/uploads/avatars/4a8f1fa1-c8b1-4620-ab5c-42969fe30153.jpg', '@fghuik,', '2025-10-05 18:27:11', '2025-10-05 18:27:11'),
('40caa71d-b239-4caa-832a-490274363f8a', 'task', '1360282c-2a47-4ec3-9bda-927707739c37', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', 'http://localhost:3000/uploads/avatars/4a8f1fa1-c8b1-4620-ab5c-42969fe30153.jpg', 'rtter', '2025-10-20 22:06:58', '2025-10-20 22:06:58'),
('58e759cc-117a-4ec8-ac1c-3c5971028316', 'task', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'DEDWE', '2025-10-01 02:45:22', '2025-10-01 02:45:22'),
('7663d901-f6c6-49fb-9e45-a13326df0c29', 'task', 'e6c64cd3-02e6-4a99-b9a4-a869517d4499', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', 'http://localhost:3000/uploads/avatars/4a8f1fa1-c8b1-4620-ab5c-42969fe30153.jpg', 'gfdgfdgfd', '2025-10-24 23:59:29', '2025-10-24 23:59:29'),
('849d6962-e00b-4f0b-ad65-72e6e87ce69f', 'task', '582b9106-e20f-40cb-a932-68dddc0e6c20', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'TEST COMMENT - 1', '2025-10-01 02:22:58', '2025-10-01 02:22:58'),
('84b043f2-3768-4e48-a79b-8a1c0c281d9a', 'task', '582b9106-e20f-40cb-a932-68dddc0e6c20', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'TEST - 3', '2025-10-01 02:29:59', '2025-10-01 02:29:59'),
('9b54d3bc-b450-4204-8ae7-aa6b48a41af5', 'task', '185aaa3f-b195-4f3d-ac92-3f9e17a166b5', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'Regular User', '/placeholder-user.jpg', 'grgtrgtrgrt', '2025-10-25 00:06:59', '2025-10-25 00:06:59'),
('b89e01a5-e14d-461e-9f6c-42fc4e693b2b', 'task', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'test user', NULL, 'dewdwe', '2025-10-01 15:33:33', '2025-10-01 15:33:33'),
('d228fa2b-48e5-4f9a-80c3-fb67c2f1d46b', 'task', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'test user', NULL, 'grtgrt', '2025-10-01 15:00:32', '2025-10-01 15:00:32'),
('d455591c-3f8f-4b97-b06f-5f40786deeb5', 'task', '582b9106-e20f-40cb-a932-68dddc0e6c20', '4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', '/placeholder-user.jpg', 'TEST COMMENT - 2', '2025-10-01 02:24:15', '2025-10-01 02:24:15');

-- --------------------------------------------------------

--
-- Table structure for table `communities`
--

CREATE TABLE `communities` (
  `id` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `color` varchar(20) DEFAULT '#6366f1',
  `visibility` enum('public','private','secret') DEFAULT 'private',
  `created_by` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_archived` tinyint(1) DEFAULT 0,
  `archived_at` timestamp NULL DEFAULT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `members_count` int(11) DEFAULT 0,
  `posts_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `communities`
--

INSERT INTO `communities` (`id`, `name`, `description`, `icon`, `color`, `visibility`, `created_by`, `created_at`, `updated_at`, `is_archived`, `archived_at`, `settings`, `members_count`, `posts_count`) VALUES
('comm_1761154409429_cbi6d3g2d', 'test', 'test', '🏘️', '#6366f1', 'private', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 17:33:28', '2025-10-22 17:33:30', 0, NULL, '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 4, 0),
('comm_1761154443600_t92vrpo6x', 'frefre', 'frefer', '🏘️', '#ef4444', 'public', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 17:34:02', '2025-10-23 15:29:50', 1, '2025-10-23 15:29:50', '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 4, 0),
('comm_1761154797231_fi9rc0huq', 'بصثبثص', 'بصبثصبث', '🏘️', '#6366f1', 'public', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 17:39:56', '2025-10-23 16:30:42', 0, NULL, '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 1, 4),
('comm_1761154914028_sqdg1hvfc', 'frefrefer', 'ferfer', '🏘️', '#6366f1', 'private', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 17:41:53', '2025-10-23 15:28:50', 1, '2025-10-23 15:28:50', '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 3, 5),
('comm_1761233278207_ztwefpozi', 'test comm', 'test', '🏘️', '#8b5cf6', 'public', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 15:27:57', '2025-10-23 21:27:01', 0, NULL, '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 3, 3),
('comm_1761255572887_vsuu4c4mq', 'tee', 'tee', '🎨', '#8b5cf6', 'private', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 21:39:32', '2025-10-23 21:48:44', 0, NULL, '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 3, 3),
('comm_1761256573818_nk9k67x86', 'fgdgfd', 'gdfgdf', '🎨', '#6366f1', 'private', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 21:56:13', '2025-10-23 21:56:13', 0, NULL, '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 2, 0),
('comm_1761256719607_1au6b59oc', 'fef', 'ewfef', '🏘️', '#6366f1', 'private', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 21:58:39', '2025-10-23 21:59:13', 0, NULL, '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 3, 1),
('comm_1761256820990_4i46ew01m', 'de', 'dewdew', '🏘️', '#6366f1', 'public', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 22:00:20', '2025-10-23 22:00:20', 0, NULL, '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 1, 0),
('comm_1761257131580_rwvnyr4si', 'fregr', 'egreg', '🏘️', '#6366f1', 'public', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 22:05:31', '2025-10-23 22:08:29', 0, NULL, '{\"allow_comments\":true,\"allow_reactions\":true,\"require_approval\":false}', 1, 1),
('comm_sample_001', 'Engineering Team', 'Share knowledge, code snippets, and technical discussions', '💻', '#6366f1', 'private', NULL, '2025-10-22 17:20:42', '2025-10-22 17:20:42', 0, NULL, NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `community_activity`
--

CREATE TABLE `community_activity` (
  `id` varchar(50) NOT NULL,
  `community_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `action` enum('created','updated','deleted','commented','reacted','joined','left','shared','mentioned','pinned','archived') NOT NULL,
  `target_type` enum('post','comment','file','vault_item','member','community','category') NOT NULL,
  `target_id` varchar(50) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `community_activity`
--

INSERT INTO `community_activity` (`id`, `community_id`, `user_id`, `action`, `target_type`, `target_id`, `metadata`, `created_at`) VALUES
('act_1761154411447_2kx80hvf0', 'comm_1761154409429_cbi6d3g2d', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761154409429_cbi6d3g2d', NULL, '2025-10-22 17:33:30'),
('act_1761154445397_6ctq7qn0o', 'comm_1761154443600_t92vrpo6x', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761154443600_t92vrpo6x', NULL, '2025-10-22 17:34:04'),
('act_1761154797622_gckqvw0s6', 'comm_1761154797231_fi9rc0huq', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761154797231_fi9rc0huq', NULL, '2025-10-22 17:39:56'),
('act_1761154915551_d8y3chsfc', 'comm_1761154914028_sqdg1hvfc', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761154914028_sqdg1hvfc', NULL, '2025-10-22 17:41:54'),
('act_1761156052376_gaejq2aip', 'comm_1761154914028_sqdg1hvfc', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761156052184_t37zm2jxz', NULL, '2025-10-22 18:00:51'),
('act_1761156058458_ur417k4u5', 'comm_1761154914028_sqdg1hvfc', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761156058271_815g5wgr0', NULL, '2025-10-22 18:00:57'),
('act_1761156070361_ybdebkfhv', 'comm_1761154914028_sqdg1hvfc', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761156070130_zqwvg7z5k', NULL, '2025-10-22 18:01:09'),
('act_1761156134105_l6jofk1zf', 'comm_1761154914028_sqdg1hvfc', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761156133915_gv2zna9zc', NULL, '2025-10-22 18:02:13'),
('act_1761156301547_n750e0mse', 'comm_1761154797231_fi9rc0huq', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761156301345_k1sgyuyk6', NULL, '2025-10-22 18:05:00'),
('act_1761156386847_fmmibzq4g', 'comm_1761154797231_fi9rc0huq', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761156386651_idr0w8eer', NULL, '2025-10-22 18:06:25'),
('act_1761158534664_3yyvj5b9u', 'comm_1761154914028_sqdg1hvfc', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761158534466_89par6u6d', NULL, '2025-10-22 18:42:13'),
('act_1761233279707_gdr65bw07', 'comm_1761233278207_ztwefpozi', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761233278207_ztwefpozi', NULL, '2025-10-23 15:27:58'),
('act_1761233331276_s03rbueqm', 'comm_1761154914028_sqdg1hvfc', '4615849c-299d-40cf-8532-6637d89d04bd', 'archived', 'community', 'comm_1761154914028_sqdg1hvfc', NULL, '2025-10-23 15:28:50'),
('act_1761233391493_z7hh3h1pd', 'comm_1761154443600_t92vrpo6x', '4615849c-299d-40cf-8532-6637d89d04bd', 'archived', 'community', 'comm_1761154443600_t92vrpo6x', NULL, '2025-10-23 15:29:50'),
('act_1761233681785_1bb8pv8jm', 'comm_1761154797231_fi9rc0huq', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761233681586_7kzqdbjhy', NULL, '2025-10-23 15:34:40'),
('act_1761236597144_gcvbvrnsq', 'comm_1761233278207_ztwefpozi', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761236596954_8j4mam1o2', NULL, '2025-10-23 16:23:16'),
('act_1761236642994_o9yft5f7e', 'comm_1761233278207_ztwefpozi', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761236642798_znssra9ql', NULL, '2025-10-23 16:24:02'),
('act_1761237043727_dvq59un1p', 'comm_1761154797231_fi9rc0huq', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761237043536_xf3l64tf3', NULL, '2025-10-23 16:30:42'),
('act_1761237091917_35wcxziql', 'comm_1761154797231_fi9rc0huq', '4615849c-299d-40cf-8532-6637d89d04bd', 'shared', 'file', 'file_1761237090990_vwuoskcho', NULL, '2025-10-23 16:31:31'),
('act_1761254821754_xnsd77pd5', 'comm_1761233278207_ztwefpozi', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'post', 'post_1761254821558_4knky3opt', NULL, '2025-10-23 21:27:01'),
('act_1761255574330_vhz0p74q8', 'comm_1761255572887_vsuu4c4mq', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761255572887_vsuu4c4mq', NULL, '2025-10-23 21:39:34'),
('act_1761255921757_9txbh0tn1', 'comm_1761255572887_vsuu4c4mq', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'created', 'post', 'post_1761255921569_3v3rolqre', NULL, '2025-10-23 21:45:21'),
('act_1761255989971_2pmjnpvwa', 'comm_1761255572887_vsuu4c4mq', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'created', 'post', 'post_1761255989779_yiel2di9q', NULL, '2025-10-23 21:46:29'),
('act_1761256125311_gmv5p5y5j', 'comm_1761255572887_vsuu4c4mq', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'created', 'post', 'post_1761256125122_bpoxdt93y', NULL, '2025-10-23 21:48:45'),
('act_1761256574777_pk0b5nza9', 'comm_1761256573818_nk9k67x86', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761256573818_nk9k67x86', NULL, '2025-10-23 21:56:14'),
('act_1761256720995_8q9j2ylln', 'comm_1761256719607_1au6b59oc', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761256719607_1au6b59oc', NULL, '2025-10-23 21:58:40'),
('act_1761256753902_22u51l7yb', 'comm_1761256719607_1au6b59oc', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'created', 'post', 'post_1761256753707_ser5nh3h2', NULL, '2025-10-23 21:59:13'),
('act_1761256821375_6g2taeqcb', 'comm_1761256820990_4i46ew01m', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761256820990_4i46ew01m', NULL, '2025-10-23 22:00:21'),
('act_1761257131964_sbe8mwnee', 'comm_1761257131580_rwvnyr4si', '4615849c-299d-40cf-8532-6637d89d04bd', 'created', 'community', 'comm_1761257131580_rwvnyr4si', NULL, '2025-10-23 22:05:31'),
('act_1761257309995_dsjffk64n', 'comm_1761257131580_rwvnyr4si', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'created', 'post', 'post_1761257309799_y1bd87ppz', NULL, '2025-10-23 22:08:29'),
('act_1761257339395_x70s23138', 'comm_1761257131580_rwvnyr4si', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'shared', 'file', 'file_1761257338073_wfqn0wju2', NULL, '2025-10-23 22:08:59');

-- --------------------------------------------------------

--
-- Table structure for table `community_categories`
--

CREATE TABLE `community_categories` (
  `id` varchar(50) NOT NULL,
  `community_id` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `parent_category_id` varchar(50) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_comments`
--

CREATE TABLE `community_comments` (
  `id` varchar(50) NOT NULL,
  `post_id` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `author_id` varchar(50) NOT NULL,
  `parent_comment_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `edited_at` timestamp NULL DEFAULT NULL,
  `reactions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`reactions`)),
  `mentioned_users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mentioned_users`)),
  `is_deleted` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `community_comments`
--

INSERT INTO `community_comments` (`id`, `post_id`, `content`, `author_id`, `parent_comment_id`, `created_at`, `updated_at`, `edited_at`, `reactions`, `mentioned_users`, `is_deleted`, `is_approved`) VALUES
('comm_1761156455546_gd8ujy65w', 'post_1761156386651_idr0w8eer', 'vdfdfv', '4615849c-299d-40cf-8532-6637d89d04bd', NULL, '2025-10-22 18:07:35', '2025-10-22 18:07:35', NULL, NULL, NULL, 0, 1),
('comm_1761156460184_se17tm4jk', 'post_1761156386651_idr0w8eer', 'vdfvdf', '4615849c-299d-40cf-8532-6637d89d04bd', NULL, '2025-10-22 18:07:39', '2025-10-22 18:07:39', NULL, NULL, NULL, 0, 1),
('comm_1761233716188_280235gpx', 'post_1761156386651_idr0w8eer', 'gff', '4615849c-299d-40cf-8532-6637d89d04bd', NULL, '2025-10-23 15:35:15', '2025-10-23 15:35:15', NULL, NULL, NULL, 0, 1),
('comm_1761236623891_m5mdpg54p', 'post_1761236596954_8j4mam1o2', ',mklhl', '4615849c-299d-40cf-8532-6637d89d04bd', NULL, '2025-10-23 16:23:43', '2025-10-23 16:23:43', NULL, NULL, NULL, 0, 1),
('comm_1761236631193_x8ofppfd6', 'post_1761236596954_8j4mam1o2', 'khfygbkjh', '4615849c-299d-40cf-8532-6637d89d04bd', NULL, '2025-10-23 16:23:50', '2025-10-23 16:23:50', NULL, NULL, NULL, 0, 1),
('comm_1761237065551_fr7tmcuhs', 'post_1761237043536_xf3l64tf3', 'bvghvgyhbh', '4615849c-299d-40cf-8532-6637d89d04bd', NULL, '2025-10-23 16:31:04', '2025-10-23 16:31:04', NULL, NULL, NULL, 0, 1),
('comm_1761237070122_21wp5fg1y', 'post_1761237043536_xf3l64tf3', 'yufyugn', '4615849c-299d-40cf-8532-6637d89d04bd', NULL, '2025-10-23 16:31:09', '2025-10-23 16:31:09', NULL, NULL, NULL, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `community_files`
--

CREATE TABLE `community_files` (
  `id` varchar(50) NOT NULL,
  `community_id` varchar(50) NOT NULL,
  `post_id` varchar(50) DEFAULT NULL,
  `file_name` varchar(500) NOT NULL,
  `file_path` varchar(1000) NOT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` varchar(50) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `description` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `downloads_count` int(11) DEFAULT 0,
  `is_public` tinyint(1) DEFAULT 0,
  `thumbnail_path` varchar(1000) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `community_files`
--

INSERT INTO `community_files` (`id`, `community_id`, `post_id`, `file_name`, `file_path`, `file_type`, `file_size`, `mime_type`, `uploaded_by`, `uploaded_at`, `description`, `notes`, `tags`, `downloads_count`, `is_public`, `thumbnail_path`) VALUES
('file_1761237090990_vwuoskcho', 'comm_1761154797231_fi9rc0huq', NULL, 'hero-visual-light__1_.png', '/uploads/communities/comm_1761154797231_fi9rc0huq/1761237090990_hero-visual-light__1_.png', 'image', 66864, 'image/png', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 16:31:30', NULL, NULL, NULL, 0, 0, NULL),
('file_1761257338073_wfqn0wju2', 'comm_1761257131580_rwvnyr4si', NULL, 'EGS72XL1C014_2025-10-21_00-57-48.png', '/uploads/communities/comm_1761257131580_rwvnyr4si/1761257338073_EGS72XL1C014_2025-10-21_00-57-48.png', 'image', 87976, 'image/png', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '2025-10-23 22:08:57', NULL, NULL, NULL, 0, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `community_members`
--

CREATE TABLE `community_members` (
  `id` varchar(50) NOT NULL,
  `community_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `role` enum('owner','admin','moderator','editor','contributor','viewer') DEFAULT 'viewer',
  `custom_permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_permissions`)),
  `joined_at` timestamp NULL DEFAULT current_timestamp(),
  `last_active_at` timestamp NULL DEFAULT NULL,
  `is_muted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `community_members`
--

INSERT INTO `community_members` (`id`, `community_id`, `user_id`, `role`, `custom_permissions`, `joined_at`, `last_active_at`, `is_muted`) VALUES
('mem_1761154409625_4md3lm6di', 'comm_1761154409429_cbi6d3g2d', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-22 17:33:28', NULL, 0),
('mem_1761154410358_tdj1u9cco', 'comm_1761154409429_cbi6d3g2d', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'viewer', NULL, '2025-10-22 17:33:29', NULL, 0),
('mem_1761154410939_rnt0v8czs', 'comm_1761154409429_cbi6d3g2d', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'viewer', NULL, '2025-10-22 17:33:30', NULL, 0),
('mem_1761154443790_mjca6mlk2', 'comm_1761154443600_t92vrpo6x', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-22 17:34:02', NULL, 0),
('mem_1761154444477_z3wfhc8wl', 'comm_1761154443600_t92vrpo6x', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'viewer', NULL, '2025-10-22 17:34:03', NULL, 0),
('mem_1761154444941_ftcpbptdx', 'comm_1761154443600_t92vrpo6x', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'viewer', NULL, '2025-10-22 17:34:04', NULL, 0),
('mem_1761154797431_ne3j5lu0v', 'comm_1761154797231_fi9rc0huq', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-22 17:39:56', NULL, 0),
('mem_1761154914227_du6yr1uf7', 'comm_1761154914028_sqdg1hvfc', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-22 17:41:53', NULL, 0),
('mem_1761154914415_zu2q7bw30', 'comm_1761154914028_sqdg1hvfc', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'viewer', NULL, '2025-10-22 17:41:53', NULL, 0),
('mem_1761233278396_5abuldemh', 'comm_1761233278207_ztwefpozi', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-23 15:27:57', NULL, 0),
('mem_1761233279195_ljyso0nk6', 'comm_1761233278207_ztwefpozi', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'viewer', NULL, '2025-10-23 15:27:58', NULL, 0),
('mem_1761255573076_mbyic80c9', 'comm_1761255572887_vsuu4c4mq', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-23 21:39:32', NULL, 0),
('mem_1761255885268_z6f3t4b6l', 'comm_1761255572887_vsuu4c4mq', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'moderator', NULL, '2025-10-23 21:44:44', NULL, 0),
('mem_1761256574007_k5rfi7yl2', 'comm_1761256573818_nk9k67x86', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-23 21:56:13', NULL, 0),
('mem_1761256574197_ueebat8g0', 'comm_1761256573818_nk9k67x86', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'viewer', NULL, '2025-10-23 21:56:13', NULL, 0),
('mem_1761256719803_adpfgio1v', 'comm_1761256719607_1au6b59oc', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-23 21:58:39', NULL, 0),
('mem_1761256719992_n8bm97vpp', 'comm_1761256719607_1au6b59oc', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'contributor', NULL, '2025-10-23 21:58:39', NULL, 0),
('mem_1761256720518_hmpnpm036', 'comm_1761256719607_1au6b59oc', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'contributor', NULL, '2025-10-23 21:58:40', NULL, 0),
('mem_1761256821183_a8n16psq2', 'comm_1761256820990_4i46ew01m', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-23 22:00:20', NULL, 0),
('mem_1761257131771_s43u5t83s', 'comm_1761257131580_rwvnyr4si', '4615849c-299d-40cf-8532-6637d89d04bd', 'owner', NULL, '2025-10-23 22:05:31', NULL, 0);

--
-- Triggers `community_members`
--
DELIMITER $$
CREATE TRIGGER `after_member_delete` AFTER DELETE ON `community_members` FOR EACH ROW BEGIN
  UPDATE communities SET members_count = members_count - 1 WHERE id = OLD.community_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_member_insert` AFTER INSERT ON `community_members` FOR EACH ROW BEGIN
  UPDATE communities SET members_count = members_count + 1 WHERE id = NEW.community_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `community_posts`
--

CREATE TABLE `community_posts` (
  `id` varchar(50) NOT NULL,
  `community_id` varchar(50) NOT NULL,
  `title` varchar(300) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `content_type` enum('markdown','rich_text','plain_text') DEFAULT 'markdown',
  `author_id` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `edited_at` timestamp NULL DEFAULT NULL,
  `is_pinned` tinyint(1) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_draft` tinyint(1) DEFAULT 0,
  `is_approved` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) DEFAULT 0,
  `views_count` int(11) DEFAULT 0,
  `reactions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`reactions`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `mentioned_users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`mentioned_users`)),
  `parent_post_id` varchar(50) DEFAULT NULL,
  `category_id` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `community_posts`
--

INSERT INTO `community_posts` (`id`, `community_id`, `title`, `content`, `content_type`, `author_id`, `created_at`, `updated_at`, `edited_at`, `is_pinned`, `is_featured`, `is_draft`, `is_approved`, `is_deleted`, `views_count`, `reactions`, `tags`, `mentioned_users`, `parent_post_id`, `category_id`) VALUES
('post_1761156052184_t37zm2jxz', 'comm_1761154914028_sqdg1hvfc', NULL, 'yfguguyhbhuj', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 18:00:51', '2025-10-22 18:00:51', NULL, 0, 0, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL),
('post_1761156058271_815g5wgr0', 'comm_1761154914028_sqdg1hvfc', NULL, 'feefsfgsg', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 18:00:57', '2025-10-22 18:00:57', NULL, 0, 0, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL),
('post_1761156070130_zqwvg7z5k', 'comm_1761154914028_sqdg1hvfc', NULL, 'dffdg', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 18:01:09', '2025-10-22 18:01:09', NULL, 0, 0, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL),
('post_1761156133915_gv2zna9zc', 'comm_1761154914028_sqdg1hvfc', NULL, 'bfdbdf', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 18:02:13', '2025-10-22 18:03:42', NULL, 0, 0, 0, 1, 0, 4, NULL, NULL, NULL, NULL, NULL),
('post_1761156301345_k1sgyuyk6', 'comm_1761154797231_fi9rc0huq', NULL, 'nbgyuhiojnmk,l', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 18:05:00', '2025-10-22 18:05:00', NULL, 0, 0, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL),
('post_1761156386651_idr0w8eer', 'comm_1761154797231_fi9rc0huq', NULL, 'hiuninjk', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 18:06:25', '2025-10-23 15:34:51', NULL, 0, 0, 0, 1, 0, 4, NULL, NULL, NULL, NULL, NULL),
('post_1761158534466_89par6u6d', 'comm_1761154914028_sqdg1hvfc', NULL, 'efwfwefwefew', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 18:42:13', '2025-10-22 18:42:13', NULL, 0, 0, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL),
('post_1761233681586_7kzqdbjhy', 'comm_1761154797231_fi9rc0huq', NULL, 'htyhtyhty', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 15:34:40', '2025-10-23 16:32:33', NULL, 0, 0, 0, 1, 0, 8, NULL, NULL, NULL, NULL, NULL),
('post_1761236596954_8j4mam1o2', 'comm_1761233278207_ztwefpozi', NULL, 'vfghbhkj', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 16:23:16', '2025-10-23 16:23:35', NULL, 0, 0, 0, 1, 0, 2, NULL, NULL, NULL, NULL, NULL),
('post_1761236642798_znssra9ql', 'comm_1761233278207_ztwefpozi', NULL, 'oiphuihuj', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 16:24:01', '2025-10-23 21:30:39', NULL, 0, 0, 0, 1, 0, 7, NULL, NULL, NULL, NULL, NULL),
('post_1761237043536_xf3l64tf3', 'comm_1761154797231_fi9rc0huq', NULL, 'bhvuybhnj', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 16:30:42', '2025-10-23 16:32:17', NULL, 0, 0, 0, 1, 0, 4, NULL, NULL, NULL, NULL, NULL),
('post_1761254821558_4knky3opt', 'comm_1761233278207_ztwefpozi', NULL, 'gerget', 'markdown', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-23 21:27:01', '2025-10-23 21:27:01', NULL, 0, 0, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL),
('post_1761255921569_3v3rolqre', 'comm_1761255572887_vsuu4c4mq', NULL, 'gyuguy', 'markdown', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '2025-10-23 21:45:21', '2025-10-23 21:45:59', NULL, 0, 0, 0, 1, 0, 2, NULL, NULL, NULL, NULL, NULL),
('post_1761255989779_yiel2di9q', 'comm_1761255572887_vsuu4c4mq', NULL, ' ‏how are you ', 'markdown', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '2025-10-23 21:46:29', '2025-10-23 21:48:29', NULL, 0, 0, 0, 1, 0, 2, NULL, NULL, NULL, NULL, NULL),
('post_1761256125122_bpoxdt93y', 'comm_1761255572887_vsuu4c4mq', NULL, 'yy', 'markdown', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '2025-10-23 21:48:44', '2025-10-23 21:48:44', NULL, 0, 0, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL),
('post_1761256753707_ser5nh3h2', 'comm_1761256719607_1au6b59oc', NULL, 'frtgyhujk', 'markdown', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '2025-10-23 21:59:13', '2025-10-23 21:59:13', NULL, 0, 0, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL),
('post_1761257309799_y1bd87ppz', 'comm_1761257131580_rwvnyr4si', NULL, 'grgregre', 'markdown', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '2025-10-23 22:08:29', '2025-10-23 22:08:29', NULL, 0, 0, 0, 1, 0, 0, NULL, NULL, NULL, NULL, NULL);

--
-- Triggers `community_posts`
--
DELIMITER $$
CREATE TRIGGER `after_post_delete` AFTER UPDATE ON `community_posts` FOR EACH ROW BEGIN
  IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
    UPDATE communities SET posts_count = posts_count - 1 WHERE id = NEW.community_id;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_post_insert` AFTER INSERT ON `community_posts` FOR EACH ROW BEGIN
  IF NEW.is_deleted = FALSE THEN
    UPDATE communities SET posts_count = posts_count + 1 WHERE id = NEW.community_id;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `community_reactions`
--

CREATE TABLE `community_reactions` (
  `id` varchar(100) NOT NULL,
  `post_id` varchar(100) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `reaction_type` enum('like','love','celebrate','support','insightful','curious') NOT NULL DEFAULT 'like',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `community_reactions`
--

INSERT INTO `community_reactions` (`id`, `post_id`, `user_id`, `reaction_type`, `created_at`) VALUES
('react_1761237131256_gblpezj1b', 'post_1761233681586_7kzqdbjhy', '4615849c-299d-40cf-8532-6637d89d04bd', 'love', '2025-10-23 16:32:10'),
('react_1761237138654_tflbz5jry', 'post_1761237043536_xf3l64tf3', '4615849c-299d-40cf-8532-6637d89d04bd', 'celebrate', '2025-10-23 16:32:17'),
('react_1761237149044_woo110zsl', 'post_1761233681586_7kzqdbjhy', '4615849c-299d-40cf-8532-6637d89d04bd', 'celebrate', '2025-10-23 16:32:28'),
('react_1761237154094_4w5awg462', 'post_1761233681586_7kzqdbjhy', '4615849c-299d-40cf-8532-6637d89d04bd', 'like', '2025-10-23 16:32:33'),
('react_1761255951428_rvcln6si6', 'post_1761255921569_3v3rolqre', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'celebrate', '2025-10-23 21:45:51'),
('react_1761256103661_uzqb8pt0n', 'post_1761255989779_yiel2di9q', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'love', '2025-10-23 21:48:23');

-- --------------------------------------------------------

--
-- Stand-in structure for view `community_stats`
-- (See below for the actual view)
--
CREATE TABLE `community_stats` (
`id` varchar(50)
,`name` varchar(200)
,`members_count` int(11)
,`posts_count` int(11)
,`total_posts` bigint(21)
,`total_comments` bigint(21)
,`total_files` bigint(21)
,`total_views` decimal(32,0)
);

-- --------------------------------------------------------

--
-- Table structure for table `community_vault`
--

CREATE TABLE `community_vault` (
  `id` varchar(50) NOT NULL,
  `community_id` varchar(50) NOT NULL,
  `title` varchar(300) NOT NULL,
  `item_type` enum('api_key','password','secret','certificate','token','credentials','other') NOT NULL,
  `encrypted_content` text NOT NULL,
  `encryption_iv` varchar(100) NOT NULL,
  `encryption_tag` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_by` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `access_count` int(11) DEFAULT 0,
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `last_accessed_by` varchar(50) DEFAULT NULL,
  `allowed_roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_roles`)),
  `allowed_users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_users`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_vault_access_log`
--

CREATE TABLE `community_vault_access_log` (
  `id` varchar(50) NOT NULL,
  `vault_item_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `action` enum('view','copy','edit','delete','decrypt') NOT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `accessed_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `community_voice_notes`
--

CREATE TABLE `community_voice_notes` (
  `id` varchar(50) NOT NULL,
  `post_id` varchar(50) DEFAULT NULL,
  `comment_id` varchar(50) DEFAULT NULL,
  `file_path` varchar(1000) NOT NULL,
  `duration` int(11) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `transcription` text DEFAULT NULL,
  `transcription_status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `created_by` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meetings`
--

CREATE TABLE `meetings` (
  `id` varchar(191) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `meeting_link` varchar(1000) NOT NULL,
  `meeting_type` varchar(32) NOT NULL DEFAULT 'zoom',
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `timezone` varchar(100) NOT NULL DEFAULT 'UTC',
  `status` varchar(16) NOT NULL DEFAULT 'scheduled',
  `created_by_id` varchar(191) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  `project_id` varchar(191) DEFAULT NULL,
  `reminder_minutes` int(11) DEFAULT 15,
  `agenda` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `recording_url` varchar(1000) DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `recurrence_pattern` varchar(50) DEFAULT NULL,
  `recurrence_end_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meetings`
--

INSERT INTO `meetings` (`id`, `title`, `description`, `meeting_link`, `meeting_type`, `start_time`, `end_time`, `timezone`, `status`, `created_by_id`, `created_at`, `updated_at`, `project_id`, `reminder_minutes`, `agenda`, `notes`, `recording_url`, `is_recurring`, `recurrence_pattern`, `recurrence_end_date`) VALUES
('5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'ffd', 'fdfdfd', 'https://hpanel.hostinger.com/websites/compumacy.com/databases/my-sql-databases', 'zoom', '2025-10-31 00:56:00', '2025-12-30 00:56:00', 'UTC', 'cancelled', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '2025-10-23 23:57:01', '2025-10-24 00:07:33', 'b14b6764-36fb-44d4-8eae-809a447d8bf0', 15, NULL, NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `meeting_attendees`
--

CREATE TABLE `meeting_attendees` (
  `id` varchar(191) NOT NULL,
  `meeting_id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `role` varchar(16) NOT NULL DEFAULT 'attendee',
  `status` varchar(16) NOT NULL DEFAULT 'pending',
  `response_at` datetime DEFAULT NULL,
  `added_at` datetime NOT NULL DEFAULT current_timestamp(),
  `notification_sent` tinyint(1) NOT NULL DEFAULT 0,
  `reminder_sent` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meeting_attendees`
--

INSERT INTO `meeting_attendees` (`id`, `meeting_id`, `user_id`, `role`, `status`, `response_at`, `added_at`, `notification_sent`, `reminder_sent`) VALUES
('30df38df-2410-4255-8a9d-1e89ebbdfc9b', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'organizer', 'accepted', NULL, '2025-10-23 23:57:01', 0, 0),
('6875e1e7-0434-4143-8252-8bbbf0a5f32b', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', '4615849c-299d-40cf-8532-6637d89d04bd', 'attendee', 'pending', NULL, '2025-10-23 23:57:01', 0, 0),
('fcdafc99-975a-43be-b967-889aef9094d6', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'attendee', 'pending', NULL, '2025-10-23 23:57:01', 0, 0);

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
  `related_type` varchar(16) DEFAULT NULL COMMENT 'task | project | subtask | meeting'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `read`, `created_at`, `user_id`, `related_id`, `related_type`) VALUES
('0219be2f-20e8-4204-8b32-48a6bdd5de05', 'meeting_cancelled', '❌ Meeting Cancelled', 'Regular User cancelled \"ffd\"', 0, '2025-10-24 00:07:36', 'system-deleted-user', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'meeting'),
('030d88b5-9459-4b14-a414-98613e2c3d97', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: ththtyhty', 0, '2025-10-25 00:07:10', 'bc0eb545-5376-497c-9649-42cb8cb594e1', '20a9a01d-c17b-4ed1-ae3b-6cf3463bae67', 'subtask'),
('08299ab5-9868-4880-8384-8cdba6fa1960', 'task_approved', 'vfbghnjmkhnbgvbfhnj', 'Your task has been approved.', 1, '2025-10-20 21:47:32', '4615849c-299d-40cf-8532-6637d89d04bd', 'fc065517-da5c-47c2-b8cd-df92bed22a87', 'task'),
('0bfc0052-cdc6-4d9b-ace7-95a8530ed56f', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', '4615849c-299d-40cf-8532-6637d89d04bd', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('0e8da9d8-853c-43a1-b291-6e6bb4ae88ed', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: ddss', 0, '2025-10-24 23:41:24', 'bc0eb545-5376-497c-9649-42cb8cb594e1', '747c75c8-5ea0-4503-b488-56ec4e48e637', 'subtask'),
('1266ca38-5d27-4d5e-9a20-38964571f565', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:53', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('16c1e760-4343-4690-946a-d4a3d827e9eb', 'task_rejected', 'test', 'Your task has been rejected.', 1, '2025-10-01 15:44:34', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('1add7b73-1202-480b-828b-d29f3b562a7f', 'timesheet_submitted', 'Timesheet submitted', 'A timesheet for 2025-10 has been submitted', 1, '2025-10-01 15:13:09', '4615849c-299d-40cf-8532-6637d89d04bd', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('1f38f07f-cb1a-4df9-b596-31f0271bd52e', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('20f168e1-d734-4310-9227-8568506f2831', 'meeting_created', '📅 New Meeting Scheduled', 'Regular User invited you to \"ffd\"', 0, '2025-10-23 23:57:04', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'meeting'),
('2bac60da-c385-48ed-a4cf-d864e974be05', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: cdfssd', 1, '2025-10-24 23:41:57', '4615849c-299d-40cf-8532-6637d89d04bd', 'ee6cd4af-8eda-4328-b8ea-c6ee10dcec73', 'subtask'),
('2cb5393f-4281-4b29-8375-29b818fd4d5e', 'task_commented', 'FREFRE', 'Admin User commented on a task.', 1, '2025-10-01 02:45:22', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'task'),
('3075121b-c654-45d1-a0d8-1c07d629e4fb', 'task_commented', 'fdsfsf', 'Admin User commented on a task.', 1, '2025-10-24 23:59:28', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'e6c64cd3-02e6-4a99-b9a4-a869517d4499', 'task'),
('31cbb194-9f05-4a80-8c35-1820ac005c0b', 'task_commented', 'DEDED', 'Regular User commented on a task.', 1, '2025-10-23 22:20:48', '4615849c-299d-40cf-8532-6637d89d04bd', '392c1f73-100d-40ed-8663-4c69a54cd8b1', 'task'),
('40c34613-766d-425d-829e-5506f266848a', 'meeting_created', '📅 New Meeting Scheduled', 'Regular User invited you to \"ffd\"', 1, '2025-10-23 23:57:03', '4615849c-299d-40cf-8532-6637d89d04bd', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'meeting'),
('42e11a5e-4987-451f-a208-215f6433ae84', 'task_approved', 'FREFRE', 'Your task has been approved.', 1, '2025-10-01 02:43:43', '4615849c-299d-40cf-8532-6637d89d04bd', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'task'),
('4429f6c1-7960-4bdf-9db8-89eaa9d5a376', 'task_pending_review', 'vfdvfdv', 'vfdvfdv is awaiting approval.', 1, '2025-10-24 23:48:03', '4615849c-299d-40cf-8532-6637d89d04bd', '185aaa3f-b195-4f3d-ac92-3f9e17a166b5', 'task'),
('45202e9e-739f-4fdf-834e-fa88034bb5f3', 'meeting_created', '📅 New Meeting Scheduled', 'Regular User invited you to \"ffd\"', 0, '2025-10-23 23:57:04', 'bc0eb545-5376-497c-9649-42cb8cb594e1', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'meeting'),
('460a757a-287a-4e7a-937d-a891b61af8fc', 'task_approved', 'TEST TASK -- 2', 'Your task has been approved.', 1, '2025-10-01 02:22:16', '4615849c-299d-40cf-8532-6637d89d04bd', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('4aae7061-9625-444e-add4-b658c261f301', 'meeting_cancelled', '❌ Meeting Cancelled', 'Regular User cancelled \"ffd\"', 0, '2025-10-24 00:07:34', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'meeting'),
('4bc62aca-fbf6-489f-ae1b-0a41e1e2106b', 'task_commented', 'vfdvfdv', 'Regular User commented on a task.', 0, '2025-10-25 00:06:59', '4615849c-299d-40cf-8532-6637d89d04bd', '185aaa3f-b195-4f3d-ac92-3f9e17a166b5', 'task'),
('4d34fb50-5e2c-4494-b8d1-8e123b375607', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: fsfdsfsdf', 0, '2025-10-24 23:59:42', 'bc0eb545-5376-497c-9649-42cb8cb594e1', '092a2fbe-8416-4642-9e0a-0c76d74a3da3', 'subtask'),
('4d83f1ee-0de2-47c8-a781-049d1d2d5be1', 'task_commented', 'bhmk,l', 'Admin User commented on a task.', 0, '2025-10-20 22:06:57', 'system-deleted-user', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('55553f09-ff68-4bf0-bac8-3aae7d2eb131', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: njkbnjk', 0, '2025-10-24 23:46:46', 'bc0eb545-5376-497c-9649-42cb8cb594e1', '0388583f-a6ee-41d0-ba57-0cc689e81707', 'subtask'),
('57ce7e55-a79b-48c8-a14a-a63b898e2f9c', 'task_approved', 'vfdvfdv', 'Your task \"vfdvfdv\" has been approved by Admin User.', 1, '2025-10-25 00:05:25', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '185aaa3f-b195-4f3d-ac92-3f9e17a166b5', 'task'),
('606b96fb-5fba-4111-a25c-5e51c6fc16ab', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: cdfssd', 0, '2025-10-24 23:41:56', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'ee6cd4af-8eda-4328-b8ea-c6ee10dcec73', 'subtask'),
('6b8f7714-a37a-4387-a59f-cca67cb6457f', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 1, '2025-10-01 02:29:59', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('6f7cffef-1115-4da1-84b3-f0fd6160570c', 'task_approved', 'fgtyuhjikolp;', 'Your task has been approved.', 1, '2025-10-05 18:24:59', '4615849c-299d-40cf-8532-6637d89d04bd', '9a58bf2f-bbc9-458a-b95b-815d7bd72fe8', 'task'),
('70a323a1-cfea-4082-9ed0-0039f92018fd', 'project_updated', 'Project updated: test project - 1', 'Project details have been updated.', 1, '2025-10-01 02:19:11', '4615849c-299d-40cf-8532-6637d89d04bd', '75841349-2407-498c-a049-7b87720f5853', 'project'),
('75ed2729-86c1-4197-8d49-154ead38f7e8', 'task_pending', 'fdsfsf', 'Your task is pending approval.', 1, '2025-10-24 23:48:28', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'e6c64cd3-02e6-4a99-b9a4-a869517d4499', 'task'),
('7668f456-3299-4f8d-8b16-29d9fab7de17', 'admin_task_rejected', 'test', 'Task \"test\" has been rejected.', 1, '2025-10-01 15:44:35', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('7c7be606-e55c-40e5-9875-3175fa5fcf1a', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: njkbnjk', 0, '2025-10-24 23:46:46', 'bc0eb545-5376-497c-9649-42cb8cb594e1', '749561e7-7327-403b-b345-77b44aed62b3', 'subtask'),
('7d34e8be-f292-4f12-bd16-cae3132aa3ae', 'mention', 'bhmk,l', 'Admin User mentioned you in a task comment.', 0, '2025-10-05 18:27:13', 'system-deleted-user', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('80012578-9949-415a-9182-7280e86c2925', 'meeting_cancelled', '❌ Meeting Cancelled', 'Regular User cancelled \"ffd\"', 0, '2025-10-24 00:07:35', '4615849c-299d-40cf-8532-6637d89d04bd', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'meeting'),
('80710ecc-52aa-460d-87d9-caeddaaba71c', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('835c8e4c-cd6b-44a4-9b74-fcc744289481', 'project_updated', 'Project updated: test project - 1', 'Project details have been updated.', 0, '2025-10-01 02:19:11', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '75841349-2407-498c-a049-7b87720f5853', 'project'),
('8361f395-79b1-4cb0-86ce-9e7b6ed365e9', 'meeting_cancelled', '❌ Meeting Cancelled', 'Regular User cancelled \"ffd\"', 0, '2025-10-24 00:07:37', 'bc0eb545-5376-497c-9649-42cb8cb594e1', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'meeting'),
('8baf32c7-562c-4bd8-9750-2b486a4a4721', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('8d07a1fa-7dad-4696-ae29-32e59bec4bd8', 'task_pending', 'vfdvfdv', 'Your task is pending approval.', 1, '2025-10-24 23:48:00', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '185aaa3f-b195-4f3d-ac92-3f9e17a166b5', 'task'),
('962a9188-033e-4665-8453-21ec31fcdb39', 'task_approved', 'fdsfsf', 'Your task \"fdsfsf\" has been approved by Admin User.', 1, '2025-10-24 23:59:16', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'e6c64cd3-02e6-4a99-b9a4-a869517d4499', 'task'),
('9be6f991-b0e3-4f00-84bd-8a27562ed3b3', 'task_pending', 'test', 'Your task is pending approval.', 1, '2025-10-01 15:00:03', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('9e8eb0c4-48dc-4b90-b121-4d09dbf7e26c', 'task_approved', 'task - 4', 'Your task has been approved.', 1, '2025-10-01 02:20:20', '4615849c-299d-40cf-8532-6637d89d04bd', 'f1b34881-eda9-4231-a34a-40efa5322ab6', 'task'),
('a1f67e54-b644-43c6-bd0e-c834be8c3ee8', 'timesheet_approved', 'Timesheet approved', 'Your 2025-10 timesheet was approved', 1, '2025-10-01 15:13:41', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('a2dca259-907d-4297-a991-19b7559ade3b', 'timesheet_returned', 'Timesheet returned', 'Your 2025-10 timesheet was returned: ttt', 1, '2025-10-01 15:12:26', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('a3aa4f41-fa9d-4226-a9ef-6ba45f5824a1', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: ththtyhty', 0, '2025-10-25 00:07:10', '15423d4c-d0ef-41eb-bd2b-11e095a7e207', '20a9a01d-c17b-4ed1-ae3b-6cf3463bae67', 'subtask'),
('aa5f3c8f-9604-444a-8bb6-b5c73b7fae7f', 'task_pending_review', 'fdsfsf', 'fdsfsf is awaiting approval.', 1, '2025-10-24 23:48:31', '4615849c-299d-40cf-8532-6637d89d04bd', 'e6c64cd3-02e6-4a99-b9a4-a869517d4499', 'task'),
('b732e605-4842-49ca-9c96-115e003da135', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: fsfdsfsdf', 0, '2025-10-24 23:59:43', '15423d4c-d0ef-41eb-bd2b-11e095a7e207', '092a2fbe-8416-4642-9e0a-0c76d74a3da3', 'subtask'),
('b9bf179a-7d9a-43b6-99c3-e79162857c8f', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 1, '2025-10-01 02:22:59', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('c0c8d868-4b0f-41d3-a2c6-2acb7987d2a2', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('c16cb553-ca10-4acf-a688-67d9ae42488e', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', '4615849c-299d-40cf-8532-6637d89d04bd', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('c1d22150-bf86-4177-b01e-81bf17ee89a1', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a subtask.', 1, '2025-10-01 02:35:56', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('c5f1b734-e9dd-4a6e-ba32-3cce184f7348', 'task_delete_request', 'Delete request for: test', 'test user has requested to delete the task \"test\".', 1, '2025-10-01 15:03:19', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('c7e22ec7-0116-4647-a475-29a4b84c5451', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:54', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('cfb86180-0441-4b48-a8b5-f531b6667069', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: fsfdsfsdf', 1, '2025-10-24 23:59:42', '4615849c-299d-40cf-8532-6637d89d04bd', '092a2fbe-8416-4642-9e0a-0c76d74a3da3', 'subtask'),
('d163ba1b-7a90-481b-bd1c-84b71c4b181e', 'mention', 'bhmk,l', 'Admin User mentioned you in a task comment.', 0, '2025-10-05 17:50:38', 'system-deleted-user', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('d366c917-5e33-4117-8120-8ab4fcfb374e', 'task_approved', 'DEDED', 'Your task has been approved.', 1, '2025-10-01 02:47:23', '4615849c-299d-40cf-8532-6637d89d04bd', '392c1f73-100d-40ed-8663-4c69a54cd8b1', 'task'),
('d5008e34-c29e-4425-a38b-6b43974d0bb9', 'task_approved', 'ءيؤبرلالاةنومظ', 'Your task has been approved.', 1, '2025-10-20 15:42:52', '4615849c-299d-40cf-8532-6637d89d04bd', 'a41ca38d-faab-4d57-af77-8d756f7e1092', 'task'),
('d78f3d7a-4964-4893-b37b-9267d402c9b2', 'meeting_created', '📅 New Meeting Scheduled', 'Regular User invited you to \"ffd\"', 0, '2025-10-23 23:57:03', 'system-deleted-user', '5079b8c2-9cc9-435d-82d4-e4d4602cced0', 'meeting'),
('d7b6363f-309f-4e84-8c16-5cc98e50131b', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 1, '2025-10-01 02:24:16', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('d811b33e-4b51-4247-a175-1c0d277b33af', 'task_commented', 'bhmk,l', 'Admin User commented on a task.', 0, '2025-10-20 22:06:51', 'system-deleted-user', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('dcf03448-78d9-4745-aada-6ab85c7da45e', 'task_approved', 'بثبقثبقثبثق', 'Your task has been approved.', 1, '2025-10-05 18:07:16', '4615849c-299d-40cf-8532-6637d89d04bd', 'b9321687-5489-4ee9-a796-118e9518d737', 'task'),
('e328f1f1-3c1c-4830-aad1-f123abf645f6', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: fsfdsfsdf', 1, '2025-10-24 23:59:43', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '092a2fbe-8416-4642-9e0a-0c76d74a3da3', 'subtask'),
('e458160f-cc79-41ef-915b-2e5484dcf8c7', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:54', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('e8e405ac-759c-42fc-a5d2-d4ff4ce2f884', 'task_pending_review', 'test', 'test is awaiting approval.', 1, '2025-10-01 15:00:04', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('ea866e3b-3a16-4292-af88-871fdf0ef3e5', 'task_commented', 'test', 'test user commented on a task.', 1, '2025-10-01 15:33:33', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('ebac6544-c77a-40e7-bf7f-a0bc62e36d11', 'task_approved', 'ق34ق', 'Your task has been approved.', 1, '2025-10-05 17:57:13', '4615849c-299d-40cf-8532-6637d89d04bd', 'e3a4cee5-27b8-438f-8c2f-7fb1e58b3f77', 'task'),
('ebf0c9c1-3c6f-4622-a2f2-a393a48d9f0f', 'task_approved', 'bhbnjmk', 'Your task has been approved.', 1, '2025-10-05 18:10:34', '4615849c-299d-40cf-8532-6637d89d04bd', '8afa250e-b8f0-4c7f-9438-8572f764b466', 'task'),
('ed7bb493-f52d-44a9-88a9-5ded196921b5', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: ddss', 1, '2025-10-24 23:41:24', '4615849c-299d-40cf-8532-6637d89d04bd', '747c75c8-5ea0-4503-b488-56ec4e48e637', 'subtask'),
('edb5166e-1aa2-4511-a7ba-981033c46f72', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: ththtyhty', 1, '2025-10-25 00:07:10', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '20a9a01d-c17b-4ed1-ae3b-6cf3463bae67', 'subtask'),
('f07996e3-7158-4623-a510-effccdf4838b', 'task_commented', 'test', 'test user commented on a task.', 1, '2025-10-01 15:00:33', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('fbc3f2d2-1dac-49df-b5f6-2e3ff28565e1', 'task_assigned', 'New Subtask Assigned', 'You have been assigned a new subtask: ththtyhty', 0, '2025-10-25 00:07:10', '4615849c-299d-40cf-8532-6637d89d04bd', '20a9a01d-c17b-4ed1-ae3b-6cf3463bae67', 'subtask'),
('fc2491e7-969f-4f51-8524-2d87f2e2400f', 'timesheet_submitted', 'Timesheet submitted', 'A timesheet for 2025-10 has been submitted', 1, '2025-10-01 15:09:02', '4615849c-299d-40cf-8532-6637d89d04bd', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('fe493dc7-3270-4332-9423-81c57ec6cdf7', 'task_approved', 'bhmk,l', 'Your task has been approved.', 1, '2025-10-05 17:46:15', '4615849c-299d-40cf-8532-6637d89d04bd', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('notif_1761145010731_uchs7q73d', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 14:56:50', '4615849c-299d-40cf-8532-6637d89d04bd', 'quest_1761145004694_3fmg6e2b6', 'questionnaire'),
('notif_1761145011113_pa7oqwdex', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 14:56:51', 'system-deleted-user', 'quest_1761145004694_3fmg6e2b6', 'questionnaire'),
('notif_1761145336709_nvqbszhfg', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 15:02:16', 'system-deleted-user', 'quest_1761145332379_j07h17dtw', 'questionnaire'),
('notif_1761145337088_udqm3802m', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 15:02:17', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'quest_1761145332379_j07h17dtw', 'questionnaire'),
('notif_1761145337470_8n0931a02', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 15:02:17', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'quest_1761145332379_j07h17dtw', 'questionnaire'),
('notif_1761145689030_230we3cqv', 'questionnaire', 'New Questionnaire Response', 'A user submitted a response to \"test\"', 0, '2025-10-22 15:08:09', '4615849c-299d-40cf-8532-6637d89d04bd', 'resp_1761145337278_inbsmfyrg', 'questionnaire_re'),
('notif_1761145815447_p8029uadj', 'questionnaire', 'Response Needs Revision', 'Your response to \"test\" needs revision. Please review the feedback and resubmit.', 0, '2025-10-22 15:10:15', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'resp_1761145337278_inbsmfyrg', 'questionnaire_re'),
('notif_1761237643644_oota1bydv', 'questionnaire', 'New Questionnaire Response', 'A user submitted a response to \"test\"', 0, '2025-10-23 16:40:43', '4615849c-299d-40cf-8532-6637d89d04bd', 'resp_1761145337278_inbsmfyrg', 'questionnaire_re'),
('notif_1761255751302_08253bd8w', 'community', 'Removed from Community', 'You have been removed from tee', 0, '2025-10-23 21:42:31', 'bc0eb545-5376-497c-9649-42cb8cb594e1', NULL, NULL),
('notif_1761255758610_m59xc9nzs', 'community', 'Role Updated', 'Your role in the community has been updated to contributor', 0, '2025-10-23 21:42:38', 'system-deleted-user', 'comm_1761255572887_vsuu4c4mq', 'community'),
('notif_1761255885651_ki7624acv', 'community', 'Added to Community', 'You\'ve been added to tee', 0, '2025-10-23 21:44:45', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'comm_1761255572887_vsuu4c4mq', 'community'),
('notif_1761255906458_6csrg4xxz', 'community', 'Role Updated', 'Your role in the community has been updated to contributor', 0, '2025-10-23 21:45:06', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'comm_1761255572887_vsuu4c4mq', 'community'),
('notif_1761255939328_rbj1jyokp', 'community', 'Role Updated', 'Your role in the community has been updated to moderator', 0, '2025-10-23 21:45:39', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'comm_1761255572887_vsuu4c4mq', 'community'),
('notif_1761257340777_9ym8v0u8c', 'community', 'New File Uploaded', 'A file has been shared in the community', 0, '2025-10-23 22:09:00', '4615849c-299d-40cf-8532-6637d89d04bd', 'comm_1761257131580_rwvnyr4si', 'community');

-- --------------------------------------------------------

--
-- Table structure for table `notifications_backup`
--

CREATE TABLE `notifications_backup` (
  `id` varchar(191) NOT NULL,
  `type` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `user_id` varchar(191) NOT NULL,
  `related_id` varchar(191) DEFAULT NULL,
  `related_type` varchar(16) DEFAULT NULL COMMENT 'task | project | subtask | meeting'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications_backup`
--

INSERT INTO `notifications_backup` (`id`, `type`, `title`, `message`, `read`, `created_at`, `user_id`, `related_id`, `related_type`) VALUES
('08299ab5-9868-4880-8384-8cdba6fa1960', 'task_approved', 'vfbghnjmkhnbgvbfhnj', 'Your task has been approved.', 1, '2025-10-20 21:47:32', '4615849c-299d-40cf-8532-6637d89d04bd', 'fc065517-da5c-47c2-b8cd-df92bed22a87', 'task'),
('0bfc0052-cdc6-4d9b-ace7-95a8530ed56f', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', '4615849c-299d-40cf-8532-6637d89d04bd', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('1266ca38-5d27-4d5e-9a20-38964571f565', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:53', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('16c1e760-4343-4690-946a-d4a3d827e9eb', 'task_rejected', 'test', 'Your task has been rejected.', 1, '2025-10-01 15:44:34', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('1add7b73-1202-480b-828b-d29f3b562a7f', 'timesheet_submitted', 'Timesheet submitted', 'A timesheet for 2025-10 has been submitted', 1, '2025-10-01 15:13:09', '4615849c-299d-40cf-8532-6637d89d04bd', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('1f38f07f-cb1a-4df9-b596-31f0271bd52e', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('2cb5393f-4281-4b29-8375-29b818fd4d5e', 'task_commented', 'FREFRE', 'Admin User commented on a task.', 1, '2025-10-01 02:45:22', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'task'),
('31cbb194-9f05-4a80-8c35-1820ac005c0b', 'task_commented', 'DEDED', 'Regular User commented on a task.', 1, '2025-10-23 22:20:48', '4615849c-299d-40cf-8532-6637d89d04bd', '392c1f73-100d-40ed-8663-4c69a54cd8b1', 'task'),
('42e11a5e-4987-451f-a208-215f6433ae84', 'task_approved', 'FREFRE', 'Your task has been approved.', 1, '2025-10-01 02:43:43', '4615849c-299d-40cf-8532-6637d89d04bd', 'd2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'task'),
('460a757a-287a-4e7a-937d-a891b61af8fc', 'task_approved', 'TEST TASK -- 2', 'Your task has been approved.', 1, '2025-10-01 02:22:16', '4615849c-299d-40cf-8532-6637d89d04bd', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('4d83f1ee-0de2-47c8-a781-049d1d2d5be1', 'task_commented', 'bhmk,l', 'Admin User commented on a task.', 0, '2025-10-20 22:06:57', '96b9d2eb-456a-4bd1-9f3c-2824f9459f12', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('6b8f7714-a37a-4387-a59f-cca67cb6457f', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 1, '2025-10-01 02:29:59', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('6f7cffef-1115-4da1-84b3-f0fd6160570c', 'task_approved', 'fgtyuhjikolp;', 'Your task has been approved.', 1, '2025-10-05 18:24:59', '4615849c-299d-40cf-8532-6637d89d04bd', '9a58bf2f-bbc9-458a-b95b-815d7bd72fe8', 'task'),
('70a323a1-cfea-4082-9ed0-0039f92018fd', 'project_updated', 'Project updated: test project - 1', 'Project details have been updated.', 1, '2025-10-01 02:19:11', '4615849c-299d-40cf-8532-6637d89d04bd', '75841349-2407-498c-a049-7b87720f5853', 'project'),
('7668f456-3299-4f8d-8b16-29d9fab7de17', 'admin_task_rejected', 'test', 'Task \"test\" has been rejected.', 1, '2025-10-01 15:44:35', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('7d34e8be-f292-4f12-bd16-cae3132aa3ae', 'mention', 'bhmk,l', 'Admin User mentioned you in a task comment.', 0, '2025-10-05 18:27:13', '96b9d2eb-456a-4bd1-9f3c-2824f9459f12', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('80710ecc-52aa-460d-87d9-caeddaaba71c', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('835c8e4c-cd6b-44a4-9b74-fcc744289481', 'project_updated', 'Project updated: test project - 1', 'Project details have been updated.', 0, '2025-10-01 02:19:11', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '75841349-2407-498c-a049-7b87720f5853', 'project'),
('8baf32c7-562c-4bd8-9750-2b486a4a4721', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:40', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('9be6f991-b0e3-4f00-84bd-8a27562ed3b3', 'task_pending', 'test', 'Your task is pending approval.', 1, '2025-10-01 15:00:03', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('9e8eb0c4-48dc-4b90-b121-4d09dbf7e26c', 'task_approved', 'task - 4', 'Your task has been approved.', 1, '2025-10-01 02:20:20', '4615849c-299d-40cf-8532-6637d89d04bd', 'f1b34881-eda9-4231-a34a-40efa5322ab6', 'task'),
('a1f67e54-b644-43c6-bd0e-c834be8c3ee8', 'timesheet_approved', 'Timesheet approved', 'Your 2025-10 timesheet was approved', 1, '2025-10-01 15:13:41', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('a2dca259-907d-4297-a991-19b7559ade3b', 'timesheet_returned', 'Timesheet returned', 'Your 2025-10 timesheet was returned: ttt', 1, '2025-10-01 15:12:26', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('b9bf179a-7d9a-43b6-99c3-e79162857c8f', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 1, '2025-10-01 02:22:59', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('c0c8d868-4b0f-41d3-a2c6-2acb7987d2a2', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('c16cb553-ca10-4acf-a688-67d9ae42488e', 'project_updated', 'Project updated: test project - 2', 'Project details have been updated.', 0, '2025-10-01 15:30:20', '4615849c-299d-40cf-8532-6637d89d04bd', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'project'),
('c1d22150-bf86-4177-b01e-81bf17ee89a1', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a subtask.', 1, '2025-10-01 02:35:56', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('c5f1b734-e9dd-4a6e-ba32-3cce184f7348', 'task_delete_request', 'Delete request for: test', 'test user has requested to delete the task \"test\".', 1, '2025-10-01 15:03:19', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('c7e22ec7-0116-4647-a475-29a4b84c5451', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:54', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('d163ba1b-7a90-481b-bd1c-84b71c4b181e', 'mention', 'bhmk,l', 'Admin User mentioned you in a task comment.', 0, '2025-10-05 17:50:38', '96b9d2eb-456a-4bd1-9f3c-2824f9459f12', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('d366c917-5e33-4117-8120-8ab4fcfb374e', 'task_approved', 'DEDED', 'Your task has been approved.', 1, '2025-10-01 02:47:23', '4615849c-299d-40cf-8532-6637d89d04bd', '392c1f73-100d-40ed-8663-4c69a54cd8b1', 'task'),
('d5008e34-c29e-4425-a38b-6b43974d0bb9', 'task_approved', 'ءيؤبرلالاةنومظ', 'Your task has been approved.', 1, '2025-10-20 15:42:52', '4615849c-299d-40cf-8532-6637d89d04bd', 'a41ca38d-faab-4d57-af77-8d756f7e1092', 'task'),
('d7b6363f-309f-4e84-8c16-5cc98e50131b', 'task_commented', 'TEST TASK -- 2', 'Admin User commented on a task.', 1, '2025-10-01 02:24:16', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'task'),
('d811b33e-4b51-4247-a175-1c0d277b33af', 'task_commented', 'bhmk,l', 'Admin User commented on a task.', 0, '2025-10-20 22:06:51', '96b9d2eb-456a-4bd1-9f3c-2824f9459f12', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('dcf03448-78d9-4745-aada-6ab85c7da45e', 'task_approved', 'بثبقثبقثبثق', 'Your task has been approved.', 1, '2025-10-05 18:07:16', '4615849c-299d-40cf-8532-6637d89d04bd', 'b9321687-5489-4ee9-a796-118e9518d737', 'task'),
('e458160f-cc79-41ef-915b-2e5484dcf8c7', 'task_assigned', 'test', 'You were assigned to a task.', 1, '2025-10-01 15:38:54', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('e8e405ac-759c-42fc-a5d2-d4ff4ce2f884', 'task_pending_review', 'test', 'test is awaiting approval.', 1, '2025-10-01 15:00:04', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('ea866e3b-3a16-4292-af88-871fdf0ef3e5', 'task_commented', 'test', 'test user commented on a task.', 1, '2025-10-01 15:33:33', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('ebac6544-c77a-40e7-bf7f-a0bc62e36d11', 'task_approved', 'ق34ق', 'Your task has been approved.', 1, '2025-10-05 17:57:13', '4615849c-299d-40cf-8532-6637d89d04bd', 'e3a4cee5-27b8-438f-8c2f-7fb1e58b3f77', 'task'),
('ebf0c9c1-3c6f-4622-a2f2-a393a48d9f0f', 'task_approved', 'bhbnjmk', 'Your task has been approved.', 1, '2025-10-05 18:10:34', '4615849c-299d-40cf-8532-6637d89d04bd', '8afa250e-b8f0-4c7f-9438-8572f764b466', 'task'),
('f07996e3-7158-4623-a510-effccdf4838b', 'task_commented', 'test', 'test user commented on a task.', 1, '2025-10-01 15:00:33', '4615849c-299d-40cf-8532-6637d89d04bd', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'task'),
('fc2491e7-969f-4f51-8524-2d87f2e2400f', 'timesheet_submitted', 'Timesheet submitted', 'A timesheet for 2025-10 has been submitted', 1, '2025-10-01 15:09:02', '4615849c-299d-40cf-8532-6637d89d04bd', 'a601b413-2251-44c4-9c99-7069ac28b595', 'timesheet'),
('fe493dc7-3270-4332-9423-81c57ec6cdf7', 'task_approved', 'bhmk,l', 'Your task has been approved.', 1, '2025-10-05 17:46:15', '4615849c-299d-40cf-8532-6637d89d04bd', '1360282c-2a47-4ec3-9bda-927707739c37', 'task'),
('notif_1761145010731_uchs7q73d', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 14:56:50', '4615849c-299d-40cf-8532-6637d89d04bd', 'quest_1761145004694_3fmg6e2b6', 'questionnaire'),
('notif_1761145011113_pa7oqwdex', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 14:56:51', '96b9d2eb-456a-4bd1-9f3c-2824f9459f12', 'quest_1761145004694_3fmg6e2b6', 'questionnaire'),
('notif_1761145336709_nvqbszhfg', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 15:02:16', '96b9d2eb-456a-4bd1-9f3c-2824f9459f12', 'quest_1761145332379_j07h17dtw', 'questionnaire'),
('notif_1761145337088_udqm3802m', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 15:02:17', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'quest_1761145332379_j07h17dtw', 'questionnaire'),
('notif_1761145337470_8n0931a02', 'questionnaire', 'New Questionnaire Available', 'You have a new mandatory questionnaire: test', 0, '2025-10-22 15:02:17', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'quest_1761145332379_j07h17dtw', 'questionnaire'),
('notif_1761145689030_230we3cqv', 'questionnaire', 'New Questionnaire Response', 'A user submitted a response to \"test\"', 0, '2025-10-22 15:08:09', '4615849c-299d-40cf-8532-6637d89d04bd', 'resp_1761145337278_inbsmfyrg', 'questionnaire_re'),
('notif_1761145815447_p8029uadj', 'questionnaire', 'Response Needs Revision', 'Your response to \"test\" needs revision. Please review the feedback and resubmit.', 0, '2025-10-22 15:10:15', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'resp_1761145337278_inbsmfyrg', 'questionnaire_re'),
('notif_1761237643644_oota1bydv', 'questionnaire', 'New Questionnaire Response', 'A user submitted a response to \"test\"', 0, '2025-10-23 16:40:43', '4615849c-299d-40cf-8532-6637d89d04bd', 'resp_1761145337278_inbsmfyrg', 'questionnaire_re'),
('notif_1761255751302_08253bd8w', 'community', 'Removed from Community', 'You have been removed from tee', 0, '2025-10-23 21:42:31', 'bc0eb545-5376-497c-9649-42cb8cb594e1', NULL, NULL),
('notif_1761255758610_m59xc9nzs', 'community', 'Role Updated', 'Your role in the community has been updated to contributor', 0, '2025-10-23 21:42:38', '96b9d2eb-456a-4bd1-9f3c-2824f9459f12', 'comm_1761255572887_vsuu4c4mq', 'community'),
('notif_1761255885651_ki7624acv', 'community', 'Added to Community', 'You\'ve been added to tee', 0, '2025-10-23 21:44:45', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'comm_1761255572887_vsuu4c4mq', 'community'),
('notif_1761255906458_6csrg4xxz', 'community', 'Role Updated', 'Your role in the community has been updated to contributor', 0, '2025-10-23 21:45:06', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'comm_1761255572887_vsuu4c4mq', 'community'),
('notif_1761255939328_rbj1jyokp', 'community', 'Role Updated', 'Your role in the community has been updated to moderator', 0, '2025-10-23 21:45:39', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'comm_1761255572887_vsuu4c4mq', 'community'),
('notif_1761257340777_9ym8v0u8c', 'community', 'New File Uploaded', 'A file has been shared in the community', 0, '2025-10-23 22:09:00', '4615849c-299d-40cf-8532-6637d89d04bd', 'comm_1761257131580_rwvnyr4si', 'community');

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
('20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'dxfh', 'ftyghj', 'planning', 'medium', '2025-10-22 00:00:00', '2025-10-29 00:00:00', '2025-10-05 17:45:34', '2025-10-20 22:07:17', NULL, 20, '4615849c-299d-40cf-8532-6637d89d04bd', 'indigo', NULL, NULL, NULL),
('75841349-2407-498c-a049-7b87720f5853', 'test project - 999', 'test project - 1', 'active', 'medium', '2025-10-28 00:00:00', '2025-10-30 00:00:00', '2025-10-01 02:06:39', '2025-10-25 00:07:57', NULL, 29, '4615849c-299d-40cf-8532-6637d89d04bd', 'amber', NULL, NULL, NULL),
('b14b6764-36fb-44d4-8eae-809a447d8bf0', 'test project - 2 (Copy)', 'test project - 2', 'planning', 'low', '2025-10-26 00:00:00', '2025-10-28 00:00:00', '2025-10-01 02:53:23', '2025-10-01 15:44:32', NULL, 50, 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'violet', NULL, NULL, NULL),
('e947d6b8-cd76-4434-b8fb-4adcee35287e', 'test project - 2', 'test project - 2', 'planning', 'low', '2025-10-18 00:00:00', '2025-10-21 00:00:00', '2025-10-01 02:08:16', '2025-10-01 15:30:39', NULL, 0, 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'violet', 4444.00, 444.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_documents`
--

CREATE TABLE `project_documents` (
  `id` varchar(191) NOT NULL,
  `project_id` varchar(191) NOT NULL,
  `name` varchar(500) NOT NULL,
  `size` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `uploaded_by_id` varchar(191) NOT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_documents`
--

INSERT INTO `project_documents` (`id`, `project_id`, `name`, `size`, `type`, `url`, `uploaded_by_id`, `uploaded_at`) VALUES
('doc_1761095649108_vetus05qb', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'EGS72XL1C014_2025-10-21_00-57-48.png', 87976, 'image/png', '/uploads/projects/20f0a46e-e9e6-4821-8bbf-626b6ef6306f/1761095649108_vetus05qb.png', '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 01:14:09');

-- --------------------------------------------------------

--
-- Table structure for table `project_notes`
--

CREATE TABLE `project_notes` (
  `id` varchar(191) NOT NULL,
  `project_id` varchar(191) NOT NULL,
  `title` varchar(500) NOT NULL,
  `content` text NOT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `created_by_id` varchar(191) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_notes`
--

INSERT INTO `project_notes` (`id`, `project_id`, `title`, `content`, `is_pinned`, `created_by_id`, `created_at`, `updated_at`) VALUES
('note_1761095038787_zpjz56x23', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'regte', 'treterter', 0, '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 01:03:58', NULL),
('note_1761095044918_lm1so39s8', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'greger', 'gergreger', 0, '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 01:04:04', NULL),
('note_1761095620225_13u8ltcmw', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'بقثببقثب', 'قثبثقبثققثب', 0, '4615849c-299d-40cf-8532-6637d89d04bd', '2025-10-22 01:13:40', NULL),
('note_1761264997776_41g2yk1gj', '75841349-2407-498c-a049-7b87720f5853', 'xf', 'erfrefr', 1, 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', '2025-10-24 00:16:37', '2025-10-24 00:16:50');

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
-- Table structure for table `questionnaires`
--

CREATE TABLE `questionnaires` (
  `id` varchar(191) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  `created_by_id` varchar(191) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_role` varchar(50) DEFAULT NULL,
  `deadline` datetime NOT NULL,
  `is_mandatory` tinyint(1) DEFAULT 1,
  `allow_late_submission` tinyint(1) DEFAULT 0,
  `show_results_to_users` tinyint(1) DEFAULT 0,
  `status` varchar(50) DEFAULT 'draft',
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questionnaires`
--

INSERT INTO `questionnaires` (`id`, `title`, `description`, `instructions`, `created_by_id`, `target_type`, `target_role`, `deadline`, `is_mandatory`, `allow_late_submission`, `show_results_to_users`, `status`, `published_at`, `created_at`, `updated_at`) VALUES
('quest_1761145004694_3fmg6e2b6', 'test', 'test', 'test', '4615849c-299d-40cf-8532-6637d89d04bd', 'specific_users', NULL, '2025-10-31 18:56:00', 1, 0, 0, 'published', '2025-10-22 14:56:50', '2025-10-22 14:56:44', '2025-10-22 14:56:50'),
('quest_1761145332379_j07h17dtw', 'test', 'test', 'test', '4615849c-299d-40cf-8532-6637d89d04bd', 'all_users', NULL, '2025-11-21 16:06:00', 1, 1, 1, 'published', '2025-10-22 15:02:16', '2025-10-22 15:02:12', '2025-10-22 15:02:16');

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_answers`
--

CREATE TABLE `questionnaire_answers` (
  `id` varchar(191) NOT NULL,
  `response_id` varchar(191) NOT NULL,
  `question_id` varchar(191) NOT NULL,
  `answer_text` text DEFAULT NULL,
  `answer_value` varchar(500) DEFAULT NULL,
  `answer_number` decimal(10,2) DEFAULT NULL,
  `answer_file_url` varchar(1000) DEFAULT NULL,
  `answer_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answer_options`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questionnaire_answers`
--

INSERT INTO `questionnaire_answers` (`id`, `response_id`, `question_id`, `answer_text`, `answer_value`, `answer_number`, `answer_file_url`, `answer_options`, `created_at`, `updated_at`) VALUES
('ans_1761237643074_pgvmw538b', 'resp_1761145337278_inbsmfyrg', 'q_1761145332575_0_8bi3lkljd', 'retretertretreterter', NULL, NULL, NULL, NULL, '2025-10-23 16:40:42', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_feedback`
--

CREATE TABLE `questionnaire_feedback` (
  `id` varchar(191) NOT NULL,
  `response_id` varchar(191) NOT NULL,
  `question_id` varchar(191) DEFAULT NULL,
  `from_user_id` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `is_critical` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_history`
--

CREATE TABLE `questionnaire_history` (
  `id` varchar(191) NOT NULL,
  `questionnaire_id` varchar(191) NOT NULL,
  `response_id` varchar(191) DEFAULT NULL,
  `user_id` varchar(191) NOT NULL,
  `action` varchar(100) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questionnaire_history`
--

INSERT INTO `questionnaire_history` (`id`, `questionnaire_id`, `response_id`, `user_id`, `action`, `notes`, `created_at`) VALUES
('hist_1761145011305_rueqiv2o1', 'quest_1761145004694_3fmg6e2b6', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'published', 'Published to 2 users', '2025-10-22 14:56:51'),
('hist_1761145337663_sias276is', 'quest_1761145332379_j07h17dtw', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'published', 'Published to 3 users', '2025-10-22 15:02:17'),
('hist_1761145689249_vzgt0vgg8', 'quest_1761145332379_j07h17dtw', NULL, 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'submitted', 'Response submitted', '2025-10-22 15:08:09'),
('hist_1761145815636_0zn1dyubk', 'quest_1761145332379_j07h17dtw', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'returned', 'frefrefrere', '2025-10-22 15:10:15'),
('hist_1761237643837_t2fg5sniu', 'quest_1761145332379_j07h17dtw', NULL, 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'submitted', 'Response submitted', '2025-10-23 16:40:43');

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_questions`
--

CREATE TABLE `questionnaire_questions` (
  `id` varchar(191) NOT NULL,
  `questionnaire_id` varchar(191) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` varchar(50) NOT NULL,
  `is_required` tinyint(1) DEFAULT 1,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `min_value` int(11) DEFAULT NULL,
  `max_value` int(11) DEFAULT NULL,
  `max_file_size` int(11) DEFAULT NULL,
  `allowed_file_types` varchar(500) DEFAULT NULL,
  `placeholder_text` varchar(500) DEFAULT NULL,
  `help_text` text DEFAULT NULL,
  `display_order` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questionnaire_questions`
--

INSERT INTO `questionnaire_questions` (`id`, `questionnaire_id`, `question_text`, `question_type`, `is_required`, `options`, `min_value`, `max_value`, `max_file_size`, `allowed_file_types`, `placeholder_text`, `help_text`, `display_order`, `created_at`) VALUES
('q_1761145005273_0_75w9pbq21', 'quest_1761145004694_3fmg6e2b6', 'text -1 ', 'text', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-10-22 14:56:45'),
('q_1761145005470_1_5q6af4wij', 'quest_1761145004694_3fmg6e2b6', 'rtyrt', 'mcq', 1, '\"[\\\"Option 1ytryrty\\\",\\\"Option 2tyryryrt\\\"]\"', NULL, NULL, NULL, NULL, NULL, NULL, 2, '2025-10-22 14:56:45'),
('q_1761145332575_0_8bi3lkljd', 'quest_1761145332379_j07h17dtw', 'test', 'text', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2025-10-22 15:02:12');

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_responses`
--

CREATE TABLE `questionnaire_responses` (
  `id` varchar(191) NOT NULL,
  `questionnaire_id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `submitted_at` datetime DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by_id` varchar(191) DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `is_late` tinyint(1) DEFAULT 0,
  `score` decimal(5,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questionnaire_responses`
--

INSERT INTO `questionnaire_responses` (`id`, `questionnaire_id`, `user_id`, `status`, `submitted_at`, `reviewed_at`, `reviewed_by_id`, `admin_notes`, `is_late`, `score`, `created_at`, `updated_at`) VALUES
('resp_1761145010534_ujk9gwexe', 'quest_1761145004694_3fmg6e2b6', '4615849c-299d-40cf-8532-6637d89d04bd', 'pending', NULL, NULL, NULL, NULL, 0, NULL, '2025-10-22 14:56:50', NULL),
('resp_1761145336898_rgb6t6iw7', 'quest_1761145332379_j07h17dtw', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'pending', NULL, NULL, NULL, NULL, 0, NULL, '2025-10-22 15:02:16', NULL),
('resp_1761145337278_inbsmfyrg', 'quest_1761145332379_j07h17dtw', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'submitted', '2025-10-23 16:40:43', '2025-10-22 15:10:15', NULL, 'frefrefrere', 0, NULL, '2025-10-22 15:02:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `questionnaire_targets`
--

CREATE TABLE `questionnaire_targets` (
  `id` varchar(191) NOT NULL,
  `questionnaire_id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL,
  `is_notified` tinyint(1) DEFAULT 0,
  `notified_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questionnaire_targets`
--

INSERT INTO `questionnaire_targets` (`id`, `questionnaire_id`, `user_id`, `is_notified`, `notified_at`, `created_at`) VALUES
('target_1761145004893_l20ez5itp', 'quest_1761145004694_3fmg6e2b6', '4615849c-299d-40cf-8532-6637d89d04bd', 0, NULL, '2025-10-22 14:56:44');

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
('0388583f-a6ee-41d0-ba57-0cc689e81707', 'f1b34881-eda9-4231-a34a-40efa5322ab6', 'njkbnjk', '', 'todo', 0, NULL, '2025-10-31 00:00:00', '2025-10-24 23:46:46', '2025-10-24 23:46:46', NULL, NULL),
('092a2fbe-8416-4642-9e0a-0c76d74a3da3', 'e6c64cd3-02e6-4a99-b9a4-a869517d4499', 'fsfdsfsdf', '', 'todo', 0, NULL, '2025-10-30 00:00:00', '2025-10-24 23:59:42', '2025-10-24 23:59:42', NULL, NULL),
('0b8d94c6-7f9f-44f5-87ed-9da3abd9eee5', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'TEST SUB TASK GTGT', '', 'review', 1, NULL, '2025-10-04 00:00:00', '2025-10-01 02:35:30', '2025-10-01 02:41:32', NULL, NULL),
('20a9a01d-c17b-4ed1-ae3b-6cf3463bae67', '185aaa3f-b195-4f3d-ac92-3f9e17a166b5', 'ththtyhty', '', 'review', 0, NULL, '2025-10-30 00:00:00', '2025-10-25 00:07:10', '2025-10-25 00:07:56', NULL, NULL),
('3162c504-2997-4ddc-8bda-28e00c746368', '1360282c-2a47-4ec3-9bda-927707739c37', 'dvsvdsdsger', '', 'done', 1, NULL, '2025-10-30 00:00:00', '2025-10-20 22:07:06', '2025-10-20 22:07:16', NULL, NULL),
('39077987-2e7a-42e9-b2c1-8786902e397b', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'DEWDWEEW', '', 'done', 1, NULL, '2025-10-09 00:00:00', '2025-10-01 02:41:21', '2025-10-01 02:41:53', NULL, NULL),
('747c75c8-5ea0-4503-b488-56ec4e48e637', 'f1b34881-eda9-4231-a34a-40efa5322ab6', 'ddss', '', 'todo', 0, NULL, '2025-10-23 00:00:00', '2025-10-24 23:41:24', '2025-10-24 23:41:24', NULL, NULL),
('749561e7-7327-403b-b345-77b44aed62b3', 'f1b34881-eda9-4231-a34a-40efa5322ab6', 'njkbnjk', '', 'todo', 0, NULL, '2025-10-31 00:00:00', '2025-10-24 23:46:46', '2025-10-24 23:46:46', NULL, NULL),
('927fe86d-f07d-44b6-8c57-b5233c620a00', '9a58bf2f-bbc9-458a-b95b-815d7bd72fe8', 'dwedwdw', '', 'todo', 1, NULL, '2025-10-15 00:00:00', '2025-10-20 18:51:09', '2025-10-20 18:51:21', NULL, NULL),
('98059116-dc6b-4a33-8682-677ca65cd48a', '9a58bf2f-bbc9-458a-b95b-815d7bd72fe8', 'dwedwdw', '', 'in-progress', 0, NULL, '2025-10-15 00:00:00', '2025-10-20 18:51:09', '2025-10-20 21:45:09', NULL, NULL),
('a183479a-7ae7-4962-91a0-e7b9f261b039', '9a58bf2f-bbc9-458a-b95b-815d7bd72fe8', 'dwedwdw', '', 'todo', 0, NULL, '2025-10-15 00:00:00', '2025-10-20 18:51:09', '2025-10-20 18:51:09', NULL, NULL),
('a6d88627-ee57-41a9-9c5d-9a77120be676', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'ferfre (Copy)', '', 'todo', 0, NULL, '2025-10-29 00:00:00', '2025-10-01 15:03:02', '2025-10-01 15:03:02', NULL, NULL),
('addd7644-797f-4e22-b2c5-4895623220d5', '9a58bf2f-bbc9-458a-b95b-815d7bd72fe8', 'dwedwdw', '', 'todo', 0, NULL, '2025-10-15 00:00:00', '2025-10-20 18:51:03', '2025-10-20 18:51:03', NULL, NULL),
('b5253438-0a19-422e-ab7c-8d90017b79ff', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'TEST SUB TASK', '', 'review', 1, NULL, '2025-10-30 00:00:00', '2025-10-01 02:35:30', '2025-10-01 02:52:47', NULL, NULL),
('b54b8aef-8f82-4b8f-b150-1e8ea334cc7f', 'd9579f08-2d7f-4c87-baa2-ada8f82b9172', 'ferfre', '', 'review', 1, NULL, '2025-10-29 00:00:00', '2025-10-01 15:00:41', '2025-10-01 15:35:54', NULL, NULL),
('ce913c0f-b523-45b2-979f-d1206ebfa8a2', '9a58bf2f-bbc9-458a-b95b-815d7bd72fe8', 'dwedwdw', '', 'todo', 0, NULL, '2025-10-15 00:00:00', '2025-10-20 18:51:02', '2025-10-20 18:51:02', NULL, NULL),
('dc1e049a-5a41-4b0d-a464-bf725d9cd56d', '9a58bf2f-bbc9-458a-b95b-815d7bd72fe8', 'dwedwdw', '', 'todo', 0, NULL, '2025-10-15 00:00:00', '2025-10-20 18:51:02', '2025-10-20 18:51:02', NULL, NULL),
('ee6cd4af-8eda-4328-b8ea-c6ee10dcec73', '582b9106-e20f-40cb-a932-68dddc0e6c20', 'cdfssd', '', 'review', 0, NULL, '2025-10-30 00:00:00', '2025-10-24 23:41:56', '2025-10-24 23:41:56', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subtask_assignees`
--

CREATE TABLE `subtask_assignees` (
  `subtask_id` varchar(191) NOT NULL,
  `user_id` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subtask_assignees`
--

INSERT INTO `subtask_assignees` (`subtask_id`, `user_id`) VALUES
('0388583f-a6ee-41d0-ba57-0cc689e81707', 'bc0eb545-5376-497c-9649-42cb8cb594e1'),
('092a2fbe-8416-4642-9e0a-0c76d74a3da3', '15423d4c-d0ef-41eb-bd2b-11e095a7e207'),
('092a2fbe-8416-4642-9e0a-0c76d74a3da3', '4615849c-299d-40cf-8532-6637d89d04bd'),
('092a2fbe-8416-4642-9e0a-0c76d74a3da3', 'bc0eb545-5376-497c-9649-42cb8cb594e1'),
('092a2fbe-8416-4642-9e0a-0c76d74a3da3', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('20a9a01d-c17b-4ed1-ae3b-6cf3463bae67', '15423d4c-d0ef-41eb-bd2b-11e095a7e207'),
('20a9a01d-c17b-4ed1-ae3b-6cf3463bae67', '4615849c-299d-40cf-8532-6637d89d04bd'),
('20a9a01d-c17b-4ed1-ae3b-6cf3463bae67', 'bc0eb545-5376-497c-9649-42cb8cb594e1'),
('20a9a01d-c17b-4ed1-ae3b-6cf3463bae67', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('747c75c8-5ea0-4503-b488-56ec4e48e637', '4615849c-299d-40cf-8532-6637d89d04bd'),
('747c75c8-5ea0-4503-b488-56ec4e48e637', 'bc0eb545-5376-497c-9649-42cb8cb594e1'),
('749561e7-7327-403b-b345-77b44aed62b3', 'bc0eb545-5376-497c-9649-42cb8cb594e1'),
('ee6cd4af-8eda-4328-b8ea-c6ee10dcec73', '4615849c-299d-40cf-8532-6637d89d04bd'),
('ee6cd4af-8eda-4328-b8ea-c6ee10dcec73', 'bc0eb545-5376-497c-9649-42cb8cb594e1');

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
('1360282c-2a47-4ec3-9bda-927707739c37', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'bhmk,l', 'cffgvbhmk.\'\\', 'review', 'medium', '2025-10-07 00:00:00', '2025-10-15 00:00:00', '2025-10-05 17:46:13', '2025-10-20 22:07:17', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 100),
('185aaa3f-b195-4f3d-ac92-3f9e17a166b5', '75841349-2407-498c-a049-7b87720f5853', 'vfdvfdv', 'dfvdfvfd', 'review', 'medium', '2025-10-30 00:00:00', '2025-10-30 00:00:00', '2025-10-24 23:48:01', '2025-10-25 00:07:56', NULL, 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'approved', '2025-10-25 00:05:26', '4615849c-299d-40cf-8532-6637d89d04bd', NULL, 0),
('392c1f73-100d-40ed-8663-4c69a54cd8b1', '75841349-2407-498c-a049-7b87720f5853', 'DEDED', 'DEWDWE\n\nTime: 08:47 - 10:47\nType: task', 'done', 'medium', '2025-10-22 00:00:00', '2025-10-22 00:00:00', '2025-10-01 02:47:22', '2025-10-01 02:52:09', '2025-10-01 02:52:09', '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 100),
('582b9106-e20f-40cb-a932-68dddc0e6c20', '75841349-2407-498c-a049-7b87720f5853', 'TEST TASK -- 2', 'TEST TASK -- 2', 'done', 'medium', '2025-11-14 00:00:00', '2025-11-27 00:00:00', '2025-10-01 02:22:15', '2025-10-24 23:41:57', '2025-10-01 02:52:28', '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 75),
('8afa250e-b8f0-4c7f-9438-8572f764b466', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'bhbnjmk', 'nhuygvbhjnmk', 'todo', 'medium', '2025-10-15 00:00:00', '2025-10-23 00:00:00', '2025-10-05 18:10:31', '2025-10-05 18:10:31', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 0),
('9a58bf2f-bbc9-458a-b95b-815d7bd72fe8', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'fgtyuhjikolp;', 'gbhyujkl;\'\\', 'todo', 'medium', '2025-10-05 18:24:56', '2025-10-05 18:24:56', '2025-10-05 18:24:56', '2025-10-20 21:45:09', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 17),
('a41ca38d-faab-4d57-af77-8d756f7e1092', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'ءيؤبرلالاةنومظ', 'لبرالاتنمكط\\\n', 'todo', 'medium', '2025-10-20 15:42:51', '2025-10-20 15:42:51', '2025-10-20 15:42:51', '2025-10-20 15:42:51', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 0),
('b9321687-5489-4ee9-a796-118e9518d737', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'بثبقثبقثبثق', 'بقثبثقبقثبثق', 'todo', 'medium', '2025-10-05 18:07:13', '2025-10-05 18:07:13', '2025-10-05 18:07:13', '2025-10-05 18:07:13', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 0),
('d2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'e947d6b8-cd76-4434-b8fb-4adcee35287e', 'FREFRE', 'FREFERFER', 'todo', 'medium', '2025-10-01 02:43:42', '2025-10-31 00:00:00', '2025-10-01 02:43:42', '2025-10-01 02:43:42', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 0),
('d9579f08-2d7f-4c87-baa2-ada8f82b9172', 'b14b6764-36fb-44d4-8eae-809a447d8bf0', 'test', 'test', 'done', 'high', '2025-10-01 15:00:02', '2025-10-21 00:00:00', '2025-10-01 15:00:02', '2025-10-01 15:44:32', '2025-10-01 15:39:04', 'bc0eb545-5376-497c-9649-42cb8cb594e1', 'rejected', NULL, NULL, '', 50),
('e3a4cee5-27b8-438f-8c2f-7fb1e58b3f77', '20f0a46e-e9e6-4821-8bbf-626b6ef6306f', 'ق34ق', '34ق34ق34', 'todo', 'medium', '2025-10-22 00:00:00', '2025-10-30 00:00:00', '2025-10-05 17:57:11', '2025-10-05 17:57:11', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 0),
('e6c64cd3-02e6-4a99-b9a4-a869517d4499', '75841349-2407-498c-a049-7b87720f5853', 'fdsfsf', 'sfsdfds', 'todo', 'medium', '2025-10-30 00:00:00', '2025-10-31 00:00:00', '2025-10-24 23:48:29', '2025-10-24 23:59:43', NULL, 'd9958d50-dcb2-4cd1-b2b0-155d62e86600', 'approved', '2025-10-24 23:59:17', '4615849c-299d-40cf-8532-6637d89d04bd', NULL, 0),
('f1b34881-eda9-4231-a34a-40efa5322ab6', '75841349-2407-498c-a049-7b87720f5853', 'task - 4', 'task - 4', 'todo', 'medium', '2025-10-22 00:00:00', '2025-10-30 00:00:00', '2025-10-01 02:20:19', '2025-10-24 23:46:46', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 0),
('fc065517-da5c-47c2-b8cd-df92bed22a87', '75841349-2407-498c-a049-7b87720f5853', 'vfbghnjmkhnbgvbfhnj', 'mngbfvbhnjmknhbgvfbhnjm\n\nTime: 03:47 - 04:47\nType: meeting', 'todo', 'medium', '2025-11-04 00:00:00', '2025-11-04 00:00:00', '2025-10-20 21:47:32', '2025-10-20 21:47:32', NULL, '4615849c-299d-40cf-8532-6637d89d04bd', 'approved', NULL, NULL, NULL, 0);

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
('185aaa3f-b195-4f3d-ac92-3f9e17a166b5', '4615849c-299d-40cf-8532-6637d89d04bd'),
('392c1f73-100d-40ed-8663-4c69a54cd8b1', '4615849c-299d-40cf-8532-6637d89d04bd'),
('582b9106-e20f-40cb-a932-68dddc0e6c20', '4615849c-299d-40cf-8532-6637d89d04bd'),
('d2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', '4615849c-299d-40cf-8532-6637d89d04bd'),
('d9579f08-2d7f-4c87-baa2-ada8f82b9172', '4615849c-299d-40cf-8532-6637d89d04bd'),
('e6c64cd3-02e6-4a99-b9a4-a869517d4499', '4615849c-299d-40cf-8532-6637d89d04bd'),
('f1b34881-eda9-4231-a34a-40efa5322ab6', '4615849c-299d-40cf-8532-6637d89d04bd'),
('fc065517-da5c-47c2-b8cd-df92bed22a87', '4615849c-299d-40cf-8532-6637d89d04bd'),
('d9579f08-2d7f-4c87-baa2-ada8f82b9172', 'bc0eb545-5376-497c-9649-42cb8cb594e1'),
('fc065517-da5c-47c2-b8cd-df92bed22a87', 'bc0eb545-5376-497c-9649-42cb8cb594e1'),
('185aaa3f-b195-4f3d-ac92-3f9e17a166b5', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('392c1f73-100d-40ed-8663-4c69a54cd8b1', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('582b9106-e20f-40cb-a932-68dddc0e6c20', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('d2d48c47-4b3e-4bd2-aaf0-4c724141ddd2', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('d9579f08-2d7f-4c87-baa2-ada8f82b9172', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
('e6c64cd3-02e6-4a99-b9a4-a869517d4499', 'd9958d50-dcb2-4cd1-b2b0-155d62e86600'),
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
('15423d4c-d0ef-41eb-bd2b-11e095a7e207', 'reggtter', 'abdullahahmeddigital@gmail.com', NULL, 'R', 'user', 'Inactive', '$2a$10$xLTwE2MoWkBSSAzHEmRefO7MDEAGaKLHN4AGiN9hHERzxu1SqamQW'),
('4615849c-299d-40cf-8532-6637d89d04bd', 'Admin User', 'admin@taskara.com', 'http://localhost:3000/uploads/avatars/4a8f1fa1-c8b1-4620-ab5c-42969fe30153.jpg', 'AU', 'admin', NULL, '$2b$10$qgm/qHQ6S7HRwK271tCAwODutPUpZ8AR7My4AJCjcC4iqm5F/zbwi'),
('bc0eb545-5376-497c-9649-42cb8cb594e1', 'test user', 'abdullah@gmail.com', NULL, 'TU', 'user', 'Inactive', '$2a$10$Xw0c4TExBMW2z2R3jXpwZ.DStPp.mqy5hu0ANbOmwTAQvUNBphZXy'),
('d9958d50-dcb2-4cd1-b2b0-155d62e86600', 'Regular User', '1@1.1', '/placeholder-user.jpg', 'RU', 'user', NULL, '$2b$10$qgm/qHQ6S7HRwK271tCAwODutPUpZ8AR7My4AJCjcC4iqm5F/zbwi'),
('system-deleted-user', 'Deleted User', 'deleted@system.local', NULL, 'DU', 'user', 'Inactive', NULL);

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
  `updated_at` datetime NOT NULL DEFAULT current_timestamp(),
  `meeting_reminders` tinyint(1) NOT NULL DEFAULT 1,
  `meeting_updates` tinyint(1) NOT NULL DEFAULT 1
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
  ADD KEY `idx_tasks_project_id` (`project_id`),
  ADD KEY `idx_tasks_created_by` (`created_by_id`),
  ADD KEY `idx_tasks_approval_status` (`approval_status`),
  ADD KEY `idx_tasks_approved_by` (`approved_by_id`);

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

-- --------------------------------------------------------

--
-- Structure for view `community_stats`
--
DROP TABLE IF EXISTS `community_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`u744630877_tasks`@`127.0.0.1` SQL SECURITY DEFINER VIEW `community_stats`  AS SELECT `c`.`id` AS `id`, `c`.`name` AS `name`, `c`.`members_count` AS `members_count`, `c`.`posts_count` AS `posts_count`, count(distinct `cp`.`id`) AS `total_posts`, count(distinct `cc`.`id`) AS `total_comments`, count(distinct `cf`.`id`) AS `total_files`, sum(`cp`.`views_count`) AS `total_views` FROM (((`communities` `c` left join `community_posts` `cp` on(`c`.`id` = `cp`.`community_id` and `cp`.`is_deleted` = 0)) left join `community_comments` `cc` on(`cp`.`id` = `cc`.`post_id` and `cc`.`is_deleted` = 0)) left join `community_files` `cf` on(`c`.`id` = `cf`.`community_id`)) GROUP BY `c`.`id`, `c`.`name`, `c`.`members_count`, `c`.`posts_count` ;

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
-- Constraints for table `communities`
--
ALTER TABLE `communities`
  ADD CONSTRAINT `communities_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `community_activity`
--
ALTER TABLE `community_activity`
  ADD CONSTRAINT `community_activity_ibfk_1` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_activity_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `community_categories`
--
ALTER TABLE `community_categories`
  ADD CONSTRAINT `community_categories_ibfk_1` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_categories_ibfk_2` FOREIGN KEY (`parent_category_id`) REFERENCES `community_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `community_comments`
--
ALTER TABLE `community_comments`
  ADD CONSTRAINT `community_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_comments_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_comments_ibfk_3` FOREIGN KEY (`parent_comment_id`) REFERENCES `community_comments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `community_files`
--
ALTER TABLE `community_files`
  ADD CONSTRAINT `community_files_ibfk_1` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_files_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `community_files_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `community_members`
--
ALTER TABLE `community_members`
  ADD CONSTRAINT `community_members_ibfk_1` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `community_posts`
--
ALTER TABLE `community_posts`
  ADD CONSTRAINT `community_posts_ibfk_1` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_posts_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_posts_ibfk_3` FOREIGN KEY (`parent_post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `community_reactions`
--
ALTER TABLE `community_reactions`
  ADD CONSTRAINT `fk_reaction_post` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reaction_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `community_vault`
--
ALTER TABLE `community_vault`
  ADD CONSTRAINT `community_vault_ibfk_1` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_vault_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `community_vault_access_log`
--
ALTER TABLE `community_vault_access_log`
  ADD CONSTRAINT `community_vault_access_log_ibfk_1` FOREIGN KEY (`vault_item_id`) REFERENCES `community_vault` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_vault_access_log_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `community_voice_notes`
--
ALTER TABLE `community_voice_notes`
  ADD CONSTRAINT `community_voice_notes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `community_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_voice_notes_ibfk_2` FOREIGN KEY (`comment_id`) REFERENCES `community_comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `community_voice_notes_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `meetings`
--
ALTER TABLE `meetings`
  ADD CONSTRAINT `meetings_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `meetings_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`);

--
-- Constraints for table `meeting_attendees`
--
ALTER TABLE `meeting_attendees`
  ADD CONSTRAINT `meeting_attendees_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `meetings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_attendees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `project_documents`
--
ALTER TABLE `project_documents`
  ADD CONSTRAINT `fk_project_docs_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_project_docs_uploader` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_notes`
--
ALTER TABLE `project_notes`
  ADD CONSTRAINT `fk_project_notes_creator` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_project_notes_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `questionnaires`
--
ALTER TABLE `questionnaires`
  ADD CONSTRAINT `questionnaires_ibfk_1` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questionnaire_answers`
--
ALTER TABLE `questionnaire_answers`
  ADD CONSTRAINT `questionnaire_answers_ibfk_1` FOREIGN KEY (`response_id`) REFERENCES `questionnaire_responses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questionnaire_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questionnaire_questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questionnaire_feedback`
--
ALTER TABLE `questionnaire_feedback`
  ADD CONSTRAINT `questionnaire_feedback_ibfk_1` FOREIGN KEY (`response_id`) REFERENCES `questionnaire_responses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questionnaire_feedback_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questionnaire_questions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `questionnaire_feedback_ibfk_3` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questionnaire_history`
--
ALTER TABLE `questionnaire_history`
  ADD CONSTRAINT `questionnaire_history_ibfk_1` FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questionnaire_history_ibfk_2` FOREIGN KEY (`response_id`) REFERENCES `questionnaire_responses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questionnaire_history_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questionnaire_questions`
--
ALTER TABLE `questionnaire_questions`
  ADD CONSTRAINT `questionnaire_questions_ibfk_1` FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questionnaire_responses`
--
ALTER TABLE `questionnaire_responses`
  ADD CONSTRAINT `questionnaire_responses_ibfk_1` FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questionnaire_responses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questionnaire_responses_ibfk_3` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `questionnaire_targets`
--
ALTER TABLE `questionnaire_targets`
  ADD CONSTRAINT `questionnaire_targets_ibfk_1` FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `questionnaire_targets_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subtasks`
--
ALTER TABLE `subtasks`
  ADD CONSTRAINT `subtasks_assignee_id_users_id_fk` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `subtasks_task_id_tasks_id_fk` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `subtask_assignees`
--
ALTER TABLE `subtask_assignees`
  ADD CONSTRAINT `subtask_assignees_ibfk_1` FOREIGN KEY (`subtask_id`) REFERENCES `subtasks` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subtask_assignees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subtask_tags`
--
ALTER TABLE `subtask_tags`
  ADD CONSTRAINT `subtask_tags_subtask_id_subtasks_id_fk` FOREIGN KEY (`subtask_id`) REFERENCES `subtasks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_tasks_approved_by` FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
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
