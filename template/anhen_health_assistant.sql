-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2025-04-14
-- 伺服器版本： 10.4.32-MariaDB
-- PHP 版本： 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+08:00"; -- 改為台灣時區

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `anhen_health_assistant`
--

-- --------------------------------------------------------

--
-- 資料表結構 `basic_health_info`
--

CREATE TABLE `basic_health_info` (
  `health_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `height` decimal(5,2) DEFAULT NULL COMMENT '身高(cm)',
  `weight` decimal(5,2) DEFAULT NULL COMMENT '體重(kg)',
  `birthday` date DEFAULT NULL COMMENT '生日',
  `gender` TINYINT DEFAULT NULL COMMENT '0: male, 1: female, 2: other',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- 傾印資料表的資料 `basic_health_info`
--

INSERT INTO `basic_health_info` (`health_id`, `user_id`, `height`, `weight`, `birthday`, `gender`, `updated_at`) VALUES
(1, 1, 175.50, 70.00, '1987-03-11', 0, '2025-03-09 12:11:59');

-- --------------------------------------------------------

--
-- 資料表結構 `blood_sugar_records`
--

CREATE TABLE `blood_sugar_records` (
  `record_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `measurement_date` datetime DEFAULT NULL COMMENT '測量時間',
  `measurement_context` ENUM('fasting', 'before_meal', 'after_meal') NOT NULL DEFAULT 'fasting' COMMENT '測量情境',
  `blood_sugar` decimal(5,2) DEFAULT NULL COMMENT '血糖值(mg/dl)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- 傾印資料表的資料 `blood_sugar_records`
--

INSERT INTO `blood_sugar_records` (`record_id`, `user_id`, `measurement_date`, `measurement_context`, `blood_sugar`, `created_at`) VALUES
(1, 1, '2025-03-09 08:00:00', 'fasting', 90.50, '2025-03-09 11:38:01');

-- --------------------------------------------------------

--
-- 資料表結構 `issue_reports`
--

CREATE TABLE `issue_reports` (
  `report_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `issue_description` text DEFAULT NULL,
  `reported_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- 傾印資料表的資料 `issue_reports`
--

INSERT INTO `issue_reports` (`report_id`, `user_id`, `issue_description`, `reported_at`) VALUES
(1, 1, '應用程式偶爾崩潰，請修復。', '2025-03-09 11:38:01'),
(2, 2, 'testtsetstset', '2025-03-23 05:34:31'),
(3, 2, 'tesasdddddddddddddddddddddddddddddddddddddddddddddddddddt', '2025-03-23 05:42:37'),
(4, 2, '測試測試測試測試測試測試測試測試測試測試', '2025-03-23 05:45:38'),
(5, 2, '測試測試測試測試測試測試測試asda測試測試測試', '2025-03-23 05:45:54');

-- --------------------------------------------------------

--
-- 資料表結構 `medication_reminders`
--

CREATE TABLE `medication_reminders` (
  `reminder_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `medication_name` varchar(100) DEFAULT NULL COMMENT '藥物名稱',
  `dosage_time` enum('morning','noon','evening') DEFAULT NULL COMMENT '用藥時間',
  `dosage_condition` enum('before_meal','after_meal','before_sleep') DEFAULT NULL COMMENT '用藥備註',
  `reminder_time` datetime DEFAULT NULL COMMENT '提醒時間',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- 傾印資料表的資料 `medication_reminders`
--

INSERT INTO `medication_reminders` (`reminder_id`, `user_id`, `medication_name`, `dosage_time`, `dosage_condition`, `reminder_time`, `created_at`) VALUES
(1, 1, 'Amlodipine', 'morning', 'after_meal', '2025-03-09 08:30:00', '2025-03-09 11:38:01');

-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `display_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` MEDIUMBLOB DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- 傾印資料表的資料 `users`
--

INSERT INTO `users` (`user_id`, `username`, `display_name`, `email`, `password`, `created_at`) VALUES
(1, 'testuser', 'test', 'testuser@example.com', '$2b$10$t5Qty0D84LNbNxP.UP2hSu7FnlHGKIODR.xlA1cHPUQXvWgTM.Afm', '2025-03-09 11:38:01'),
(2, 'yee', '1', 'yee@gmail.com', '$2b$10$Od8i3C1QS.UW/XwXVme1iOXs85yVab1nWNiY/jgV8pBVuKiAQlo86', '2025-03-23 03:13:00'),
(3, 'yee2323', '2', 'qweqwe@gmail.com', '$2b$10$X5hwcEcBGlfLHB6Tt83cge.pkUYp5tIWQSj3ImMnj3Tb/1vdFWSxC', '2025-03-23 03:18:58'),
(8, 'yee2323d', 'aaa', 'qweqwes@gmail.com', '$2b$10$DXgOi3yT1ScYxzjgUr0dSeqRHio09/e8LOsyl6qHmwjfSi6/tZMRW', '2025-03-23 04:26:30'),
(10, 'yee2323wwd', 'aaa', 'qweqwewws@gmail.com', '$2b$10$WnlyQ3uLYVvK9wnEe0GF6e/a4kOcCKrx7ibKjl7BB3H5pMTpq0T.S', '2025-03-23 04:26:42');

-- --------------------------------------------------------

--
-- 資料表結構 `vital_records`
--

CREATE TABLE `vital_records` (
  `vital_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `measurement_date` datetime DEFAULT NULL COMMENT '測量時間',
  `heart_rate` int(11) DEFAULT NULL COMMENT '心跳(下/分鐘)',
  `systolic_pressure` int(11) DEFAULT NULL COMMENT '收縮壓(mmHg)',
  `diastolic_pressure` int(11) DEFAULT NULL COMMENT '舒張壓(mmHg)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- 傾印資料表的資料 `vital_records`
--

INSERT INTO `vital_records` (`vital_id`, `user_id`, `measurement_date`, `heart_rate`, `systolic_pressure`, `diastolic_pressure`, `created_at`) VALUES
(1, 1, '2025-03-09 08:00:00', 72, 120, 80, '2025-03-09 11:38:01');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `basic_health_info`
--
ALTER TABLE `basic_health_info`
  ADD PRIMARY KEY (`health_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 資料表索引 `blood_sugar_records`
--
ALTER TABLE `blood_sugar_records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 資料表索引 `issue_reports`
--
ALTER TABLE `issue_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 資料表索引 `medication_reminders`
--
ALTER TABLE `medication_reminders`
  ADD PRIMARY KEY (`reminder_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 資料表索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- 資料表索引 `vital_records`
--
ALTER TABLE `vital_records`
  ADD PRIMARY KEY (`vital_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `basic_health_info`
--
ALTER TABLE `basic_health_info`
  MODIFY `health_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `blood_sugar_records`
--
ALTER TABLE `blood_sugar_records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `issue_reports`
--
ALTER TABLE `issue_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `medication_reminders`
--
ALTER TABLE `medication_reminders`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `vital_records`
--
ALTER TABLE `vital_records`
  MODIFY `vital_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `basic_health_info`
--
ALTER TABLE `basic_health_info`
  ADD CONSTRAINT `basic_health_info_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `blood_sugar_records`
--
ALTER TABLE `blood_sugar_records`
  ADD CONSTRAINT `blood_sugar_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `issue_reports`
--
ALTER TABLE `issue_reports`
  ADD CONSTRAINT `issue_reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `medication_reminders`
--
ALTER TABLE `medication_reminders`
  ADD CONSTRAINT `medication_reminders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `vital_records`
--
ALTER TABLE `vital_records`
  ADD CONSTRAINT `vital_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;