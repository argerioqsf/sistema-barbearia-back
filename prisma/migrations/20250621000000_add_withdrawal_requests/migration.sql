-- AlterTable
ALTER TABLE `appointments` ADD COLUMN `saleId` VARCHAR(191);

-- CreateTable
CREATE TABLE `withdrawal_requests` (
    `id` VARCHAR(191) NOT NULL,
    `applicantId` VARCHAR(191) NOT NULL,
    `unitId` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191),
    `status` ENUM('ACCEPTED', 'REJECTED', 'WAITING') NOT NULL DEFAULT 'WAITING',
    `userWhoActedId` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `units`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `withdrawal_requests_userWhoActedId_fkey` FOREIGN KEY (`userWhoActedId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
