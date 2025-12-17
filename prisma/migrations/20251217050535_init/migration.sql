-- CreateTable
CREATE TABLE `connections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('ChromaNormal', 'ChromaCloud') NOT NULL,
    `normal_host` VARCHAR(191) NULL,
    `normal_port` INTEGER NULL,
    `cloud_api_key` VARCHAR(191) NULL,
    `cloud_tenant` VARCHAR(191) NULL,
    `cloud_database` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `connections_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
