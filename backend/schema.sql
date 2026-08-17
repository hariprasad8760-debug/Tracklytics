-- ============================================================================
-- TRACKLYTICS - SMART EXPENSE & STUDY ANALYTICS SYSTEM
-- MYSQL DATABASE CREATION & SEED SCRIPT
-- Database Name: tracklytics_db
-- Target DBMS: MySQL 8.0+ / MariaDB / Spring Boot JPA
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `tracklytics_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tracklytics_db`;

-- ----------------------------------------------------------------------------
-- 1. CLEANUP PREVIOUS TABLES
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `planner_events`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `study_sessions`;
DROP TABLE IF EXISTS `users`;

-- ----------------------------------------------------------------------------
-- 2. TABLE: users
-- ----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `monthly_budget` DECIMAL(10, 2) DEFAULT 5000.00,
  `daily_target_hours` DECIMAL(4, 2) DEFAULT 4.00,
  `account_status` VARCHAR(20) DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 3. TABLE: study_sessions
-- ----------------------------------------------------------------------------
CREATE TABLE `study_sessions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `subject_name` VARCHAR(100) NOT NULL,
  `duration_minutes` INT NOT NULL,
  `focus_score` DECIMAL(5, 2) DEFAULT 90.00,
  `session_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_study_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 4. TABLE: expenses
-- ----------------------------------------------------------------------------
CREATE TABLE `expenses` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `expense_date` DATE NOT NULL,
  `payment_method` VARCHAR(50) DEFAULT 'CARD',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_expense_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 5. TABLE: planner_events
-- ----------------------------------------------------------------------------
CREATE TABLE `planner_events` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `event_type` VARCHAR(30) NOT NULL, -- 'STUDY', 'EXPENSE', 'EXAM'
  `day_of_month` INT NOT NULL,
  `event_time` VARCHAR(20) DEFAULT '10:00 AM',
  `color_code` VARCHAR(20) DEFAULT '#8b5cf6',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_event_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 6. INITIAL DEMO SEED DATA
-- ----------------------------------------------------------------------------
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `currency`, `monthly_budget`, `daily_target_hours`) VALUES
(1, 'Hari Prasath', 'hari@tracklytics.com', '$2a$10$e8wYV9xJvN0x6bH1g0H8/.kZ5n3fQ2W8mXy1bZ5aK0L2mN3oP4q5r', 'USD', 5000.00, 4.00);

INSERT INTO `study_sessions` (`user_id`, `subject_name`, `duration_minutes`, `focus_score`, `session_date`) VALUES
(1, 'Spring Boot 3 Architecture', 240, 94.50, '2026-07-26'),
(1, 'React Hooks & State', 180, 92.00, '2026-07-25'),
(1, 'System Design & Distributed DB', 150, 95.00, '2026-07-24'),
(1, 'Data Structures & Algorithms', 120, 88.50, '2026-07-23');

INSERT INTO `expenses` (`user_id`, `title`, `amount`, `category`, `expense_date`) VALUES
(1, 'ChatGPT Plus Subscription', 20.00, 'Software & AI Tools', '2026-07-26'),
(1, 'Claude Pro Subscription', 20.00, 'Software & AI Tools', '2026-07-25'),
(1, 'Spring Boot Microservices Course', 89.99, 'Education & Courses', '2026-07-24'),
(1, 'Starbucks Study Session Cafe', 14.50, 'Dining & Coffee Study', '2026-07-23');

INSERT INTO `planner_events` (`user_id`, `title`, `event_type`, `day_of_month`, `event_time`, `color_code`) VALUES
(1, 'Spring Boot 3 JWT Security Quiz', 'EXAM', 26, '10:00 AM', '#8b5cf6'),
(1, 'Claude Pro Renewal', 'EXPENSE', 27, '02:00 PM', '#ec4899'),
(1, 'System Design Review', 'STUDY', 28, '04:30 PM', '#3b82f6');
