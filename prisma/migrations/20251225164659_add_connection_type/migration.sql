-- AlterTable
ALTER TABLE `connections` MODIFY `type` ENUM('ChromaNormal', 'ChromaCloud', 'WeaviateCloud') NOT NULL;
