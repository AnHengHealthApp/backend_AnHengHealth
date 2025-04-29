-- --------------------------------------------------------
-- 主機:                           127.0.0.1
-- 伺服器版本:                        8.4.4 - MySQL Community Server - GPL
-- 伺服器作業系統:                      Win64
-- HeidiSQL 版本:                  12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- 傾印 anhen_health_assistant 的資料庫結構
CREATE DATABASE IF NOT EXISTS `anhen_health_assistant` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `anhen_health_assistant`;

-- 傾印  資料表 anhen_health_assistant.basic_health_info 結構
CREATE TABLE IF NOT EXISTS `basic_health_info` (
  `health_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `height` decimal(5,2) DEFAULT NULL COMMENT '身高(cm)',
  `weight` decimal(5,2) DEFAULT NULL COMMENT '體重(kg)',
  `birthday` date DEFAULT NULL COMMENT '生日',
<<<<<<< Updated upstream
  `gender` TINYINT DEFAULT NULL COMMENT '0: male, 1: female, 2: other',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- 傾印資料表的資料 `basic_health_info`
--
=======
  `gender` tinyint DEFAULT NULL COMMENT '0: male, 1: female, 2: other',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`health_id`),
  UNIQUE KEY `unique_user` (`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `basic_health_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
>>>>>>> Stashed changes

-- 正在傾印表格  anhen_health_assistant.basic_health_info 的資料：~1 rows (近似值)
INSERT INTO `basic_health_info` (`health_id`, `user_id`, `height`, `weight`, `birthday`, `gender`, `updated_at`) VALUES
	(1, 1, 175.50, 70.00, '1987-03-11', 0, '2025-03-09 04:11:59'),
	(2, 2, 161.00, 65.00, '1928-06-01', 2, '2025-04-15 10:50:33');

-- 傾印  資料表 anhen_health_assistant.blood_sugar_records 結構
CREATE TABLE IF NOT EXISTS `blood_sugar_records` (
  `record_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `measurement_date` datetime DEFAULT NULL COMMENT '測量時間',
<<<<<<< Updated upstream
  `measurement_context` ENUM('fasting', 'before_meal', 'after_meal') NOT NULL DEFAULT 'fasting' COMMENT '測量情境',
=======
  `measurement_context` tinyint NOT NULL DEFAULT '0' COMMENT '測量情境: 0=空腹, 1=餐前, 2=餐後',
>>>>>>> Stashed changes
  `blood_sugar` decimal(5,2) DEFAULT NULL COMMENT '血糖值(mg/dl)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`record_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `blood_sugar_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3 COMMENT='血糖';

-- 正在傾印表格  anhen_health_assistant.blood_sugar_records 的資料：~3 rows (近似值)
INSERT INTO `blood_sugar_records` (`record_id`, `user_id`, `measurement_date`, `measurement_context`, `blood_sugar`, `created_at`) VALUES
	(1, 1, '2025-03-09 08:00:00', 0, 90.50, '2025-03-09 03:38:01'),
	(2, 1, '1928-06-01 15:22:11', 0, 89.00, '2025-04-15 09:57:48'),
	(3, 1, '1928-06-01 15:22:11', 2, 68.00, '2025-04-15 09:58:18'),
	(4, 2, '1928-06-01 15:22:11', 2, 68.00, '2025-04-29 06:42:11'),
	(5, 2, '1928-06-01 15:22:11', 2, 68.00, '2025-04-29 06:42:36'),
	(6, 2, '2005-06-01 15:22:11', 2, 68.00, '2025-04-29 06:47:06'),
	(7, 2, '2005-06-02 15:22:11', 2, 68.00, '2025-04-29 06:47:13'),
	(8, 2, '2005-06-02 15:22:11', 2, 68.00, '2025-04-29 06:47:14'),
	(9, 2, '2005-06-02 15:22:11', 2, 68.00, '2025-04-29 06:47:15'),
	(10, 2, '2005-06-05 15:22:11', 2, 68.00, '2025-04-29 06:47:17'),
	(11, 2, '2005-06-05 15:22:11', 2, 68.00, '2025-04-29 06:47:17'),
	(12, 2, '2005-06-05 15:22:11', 2, 68.00, '2025-04-29 06:47:18');

-- 傾印  資料表 anhen_health_assistant.issue_reports 結構
CREATE TABLE IF NOT EXISTS `issue_reports` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `issue_description` text,
  `reported_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`report_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `issue_reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb3 COMMENT='問題回報';

-- 正在傾印表格  anhen_health_assistant.issue_reports 的資料：~5 rows (近似值)
INSERT INTO `issue_reports` (`report_id`, `user_id`, `issue_description`, `reported_at`) VALUES
	(1, 1, '應用程式偶爾崩潰，請修復。', '2025-03-09 03:38:01'),
	(2, 2, 'testtsetstset', '2025-03-22 21:34:31'),
	(3, 2, 'tesasdddddddddddddddddddddddddddddddddddddddddddddddddddt', '2025-03-22 21:42:37'),
	(4, 2, '測試測試測試測試測試測試測試測試測試測試', '2025-03-22 21:45:38'),
	(5, 2, '測試測試測試測試測試測試測試asda測試測試測試', '2025-03-22 21:45:54'),
	(6, 2, '在使用健康管理系統時，我發現當我嘗試新增血糖紀錄的時候，輸入數值並按下儲存按鈕後，畫面沒有任何反應。沒有跳出提示訊息，也沒有轉跳或顯示儲存成功的資訊。我試過重新整理頁面、更換瀏覽器（Chrome、Edge）以及清除快取，但問題仍然存在。根據我觀察，這個問題只出現在特定時間，例如凌晨或是系統閒置一段時間後再次使用時。', '2025-04-15 11:58:42');

-- 傾印  資料表 anhen_health_assistant.medication_reminders 結構
CREATE TABLE IF NOT EXISTS `medication_reminders` (
  `reminder_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `medication_name` varchar(100) DEFAULT NULL COMMENT '藥物名稱',
  `dosage_time` enum('morning','noon','evening') DEFAULT NULL COMMENT '用藥時間',
  `dosage_condition` enum('before_meal','after_meal','before_sleep') DEFAULT NULL COMMENT '用藥備註',
  `reminder_time` datetime DEFAULT NULL COMMENT '提醒時間',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reminder_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `medication_reminders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- 正在傾印表格  anhen_health_assistant.medication_reminders 的資料：~1 rows (近似值)
INSERT INTO `medication_reminders` (`reminder_id`, `user_id`, `medication_name`, `dosage_time`, `dosage_condition`, `reminder_time`, `created_at`) VALUES
	(1, 1, 'Amlodipine', 'morning', 'after_meal', '2025-03-09 08:30:00', '2025-03-09 03:38:01');

-- 傾印  資料表 anhen_health_assistant.password_resets 結構
CREATE TABLE IF NOT EXISTS `password_resets` (
  `reset_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reset_id`),
  UNIQUE KEY `unique_user_id` (`user_id`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 正在傾印表格  anhen_health_assistant.password_resets 的資料：~0 rows (近似值)
INSERT INTO `password_resets` (`reset_id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
	(1, 2, '4ce53ac161c0013455ea988db1cbeeee4652ad46872672db9f459131a1faf45f', '2025-04-29 16:12:38', '2025-04-29 07:57:37');

-- 傾印  資料表 anhen_health_assistant.users 結構
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `display_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` mediumblob,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;

-- 正在傾印表格  anhen_health_assistant.users 的資料：~5 rows (近似值)
INSERT INTO `users` (`user_id`, `username`, `display_name`, `email`, `password`, `avatar`, `created_at`) VALUES
	(1, 'testuser', 'test', 'testuser@example.com', '$2b$10$t5Qty0D84LNbNxP.UP2hSu7FnlHGKIODR.xlA1cHPUQXvWgTM.Afm', NULL, '2025-03-09 03:38:01'),
	(2, 'yee', '1', 'reuacez@gmail.com', '$2b$10$Od8i3C1QS.UW/XwXVme1iOXs85yVab1nWNiY/jgV8pBVuKiAQlo86', NULL, '2025-03-22 19:13:00'),
	(3, 'yee2323', '2', 'qweqwe@gmail.com', '$2b$10$X5hwcEcBGlfLHB6Tt83cge.pkUYp5tIWQSj3ImMnj3Tb/1vdFWSxC', NULL, '2025-03-22 19:18:58'),
	(8, 'yee2323d', 'aaa', 'qweqwes@gmail.com', '$2b$10$DXgOi3yT1ScYxzjgUr0dSeqRHio09/e8LOsyl6qHmwjfSi6/tZMRW', NULL, '2025-03-22 20:26:30'),
	(10, 'yee2323wwd', 'aaa', 'qweqwewws@gmail.com', '$2b$10$WnlyQ3uLYVvK9wnEe0GF6e/a4kOcCKrx7ibKjl7BB3H5pMTpq0T.S', NULL, '2025-03-22 20:26:42');

-- 傾印  資料表 anhen_health_assistant.vital_records 結構
CREATE TABLE IF NOT EXISTS `vital_records` (
  `vital_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `measurement_date` datetime DEFAULT NULL COMMENT '測量時間',
  `heart_rate` int DEFAULT NULL COMMENT '心跳(下/分鐘)',
  `systolic_pressure` int DEFAULT NULL COMMENT '收縮壓(mmHg)',
  `diastolic_pressure` int DEFAULT NULL COMMENT '舒張壓(mmHg)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`vital_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `vital_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COMMENT='血壓';

-- 正在傾印表格  anhen_health_assistant.vital_records 的資料：~1 rows (近似值)
INSERT INTO `vital_records` (`vital_id`, `user_id`, `measurement_date`, `heart_rate`, `systolic_pressure`, `diastolic_pressure`, `created_at`) VALUES
	(1, 1, '2025-03-09 08:00:00', 72, 120, 80, '2025-03-09 03:38:01');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
 