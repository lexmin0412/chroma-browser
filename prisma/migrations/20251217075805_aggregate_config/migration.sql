/*
  Warnings:

  - You are about to drop the column `cloud_api_key` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `cloud_database` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `cloud_tenant` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `normal_host` on the `connections` table. All the data in the column will be lost.
  - You are about to drop the column `normal_port` on the `connections` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `connections` DROP COLUMN `cloud_api_key`,
    DROP COLUMN `cloud_database`,
    DROP COLUMN `cloud_tenant`,
    DROP COLUMN `normal_host`,
    DROP COLUMN `normal_port`,
    ADD COLUMN `config` JSON NULL;
