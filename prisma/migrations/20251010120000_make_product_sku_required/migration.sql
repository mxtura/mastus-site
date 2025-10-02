-- Ensure all existing products have a SKU before enforcing NOT NULL
UPDATE `Product`
SET `sku` = CONCAT('TEMP-', SUBSTRING(UUID(), 8, 8))
WHERE `sku` IS NULL OR `sku` = '';

-- Make SKU required
ALTER TABLE `Product`
MODIFY `sku` VARCHAR(191) NOT NULL;
