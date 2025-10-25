mysqldump: Couldn't execute 'SELECT COLUMN_NAME,                       JSON_EXTRACT(HISTOGRAM, '$."number-of-buckets-specified"')                FROM information_schema.COLUMN_STATISTICS                WHERE SCHEMA_NAME = 'u744630877_tasks' AND TABLE_NAME = 'attachments';': Unknown table 'COLUMN_STATISTICS' in information_schema (1109)

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `entity_id` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `attachments_uploaded_by_id_users_id_fk` (`uploaded_by_id`),
  CONSTRAINT `attachments_uploaded_by_id_users_id_fk` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
