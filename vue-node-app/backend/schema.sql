DROP DATABASE IF EXISTS ngt_safe_co2;
CREATE DATABASE IF NOT EXISTS ngt_safe_co2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ngt_safe_co2;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('PASIEN', 'PERAWAT') NOT NULL DEFAULT 'PASIEN',
  phone VARCHAR(30) NULL,
  alamat VARCHAR(255) NULL,
  profile_photo LONGTEXT NULL,
  otp_code VARCHAR(10) NULL,
  otp_expires_at DATETIME NULL,
  email_verified_at DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  device_name VARCHAR(150) NOT NULL,
  device_code VARCHAR(100) UNIQUE NOT NULL,
  device_token VARCHAR(255) NOT NULL,
  location VARCHAR(150) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  last_seen_at DATETIME NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_devices_user_id (user_id),
  INDEX idx_devices_device_code (device_code),
  CONSTRAINT fk_devices_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  co2_ppm DECIMAL(10,2) NULL,
  co2_percent DECIMAL(8,4) NULL,
  previous_co2_ppm DECIMAL(10,2) NULL,
  delta_co2_ppm DECIMAL(10,2) NULL,
  co2_trend VARCHAR(30) NULL,
  respiratory_pattern_detected TINYINT(1) NOT NULL DEFAULT 0,
  ngt_status VARCHAR(80) NOT NULL,
  risk_level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
  message TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_readings_device_id (device_id),
  INDEX idx_readings_created_at (created_at),
  INDEX idx_readings_risk_level (risk_level),
  CONSTRAINT fk_readings_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  reading_id INT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  level ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_alerts_device_id (device_id),
  INDEX idx_alerts_is_read (is_read),
  INDEX idx_alerts_created_at (created_at),
  CONSTRAINT fk_alerts_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  CONSTRAINT fk_alerts_reading FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contact_persons_name (name)
) ENGINE=InnoDB;

INSERT INTO users (name, email, password, role, phone, alamat, email_verified_at, created_at, updated_at)
VALUES
  ('Pasien Demo', 'pasien@iot.local', '$2a$10$zKcSXMhljtmfFUE/oUel0.ghMWLTEtmeRlo87zeuLKbNSSWYbSXcG', 'PASIEN', '085261234567', 'Jl. Kesehatan No. 10', NOW(), NOW(), NOW()),
  ('Perawat Demo', 'perawat@iot.local', '$2a$10$iG7WIworlnHdYfxkArOw4engmNStjO46ItoCcu6n8aiz744Pf1ST6', 'PERAWAT', '085277654321', 'Rumah Sakit Pusat', NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = VALUES(role),
  phone = VALUES(phone),
  alamat = VALUES(alamat),
  email_verified_at = VALUES(email_verified_at),
  updated_at = NOW();
