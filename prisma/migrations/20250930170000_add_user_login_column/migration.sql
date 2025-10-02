-- Add login column to users, ensure unique constraint, and relax email requirement

-- 1) Add nullable column first to avoid issues with existing rows
ALTER TABLE `User`
ADD COLUMN `login` VARCHAR(191) NULL;

-- 2) Populate login for existing users that might not have one yet
UPDATE `User`
SET `login` = CONCAT('user_', SUBSTRING(UUID(), 1, 8))
WHERE `login` IS NULL OR `login` = '';

-- 3) Enforce NOT NULL on login
ALTER TABLE `User`
MODIFY `login` VARCHAR(191) NOT NULL;

-- 4) Ensure email can be nullable (if it isn't already)
ALTER TABLE `User`
MODIFY `email` VARCHAR(191) NULL;

-- 5) Add unique index on login
CREATE UNIQUE INDEX `User_login_key` ON `User`(`login`);
