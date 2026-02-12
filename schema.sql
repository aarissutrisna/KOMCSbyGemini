-- MariaDB 11.4 Optimized Schema v2.2 (UUID & Soft Delete)
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabel Cabang
CREATE TABLE IF NOT EXISTS `branches` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `target_min` BIGINT NOT NULL DEFAULT 0,
    `target_max` BIGINT NOT NULL DEFAULT 0,
    `n8n_endpoint` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_branches_active` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel User
CREATE TABLE IF NOT EXISTS `users` (
    `id` CHAR(36) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'HRD', 'CS') NOT NULL,
    `branch_id` CHAR(36) DEFAULT NULL,
    `faktor_pengali` DECIMAL(3,2) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_username` (`username`),
    INDEX `idx_users_branch` (`branch_id`),
    INDEX `idx_users_active` (`deleted_at`),
    CONSTRAINT `fk_users_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Omzet
CREATE TABLE IF NOT EXISTS `omzet` (
    `id` CHAR(36) NOT NULL,
    `branch_id` CHAR(36) NOT NULL,
    `tanggal` DATE NOT NULL,
    `total` BIGINT NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'FINAL', 'LOCKED') NOT NULL DEFAULT 'DRAFT',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `deleted_at` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_branch_date` (`branch_id`, `tanggal`),
    INDEX `idx_omzet_active` (`deleted_at`),
    CONSTRAINT `fk_omzet_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Absensi
CREATE TABLE IF NOT EXISTS `attendance` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `tanggal` DATE NOT NULL,
    `status` DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_user_date` (`user_id`, `tanggal`),
    CONSTRAINT `fk_attendance_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel Mutasi Ledger
CREATE TABLE IF NOT EXISTS `commission_mutations` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `tanggal` DATE NOT NULL,
    `tipe` ENUM('IN', 'OUT') NOT NULL,
    `nominal` BIGINT NOT NULL,
    `saldo_after` BIGINT NOT NULL,
    `keterangan` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_user_mutation` (`user_id`, `tanggal`),
    CONSTRAINT `fk_mutations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Audit Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) DEFAULT NULL,
    `action` VARCHAR(255) NOT NULL,
    `details` JSON DEFAULT NULL,
    `ip_address` VARCHAR(45) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
