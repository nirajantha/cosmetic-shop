-- Simplify the order workflow to PENDING -> IN_PROGRESS -> COMPLETED (or CANCELLED).

-- 1. Widen the enum so old and new values can coexist while existing rows are remapped.
ALTER TABLE `Order` MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- 2. Remap legacy statuses.
UPDATE `Order` SET `status` = 'IN_PROGRESS' WHERE `status` IN ('CONFIRMED', 'PROCESSING', 'SHIPPED');
UPDATE `Order` SET `status` = 'COMPLETED' WHERE `status` = 'DELIVERED';

-- 3. Narrow the enum to the new set.
ALTER TABLE `Order` MODIFY `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- 4. Track when an order was completed (drives sales/revenue reporting).
ALTER TABLE `Order` ADD COLUMN `completedAt` DATETIME(3) NULL;
UPDATE `Order` SET `completedAt` = `updatedAt` WHERE `status` = 'COMPLETED';
CREATE INDEX `Order_completedAt_idx` ON `Order`(`completedAt`);
