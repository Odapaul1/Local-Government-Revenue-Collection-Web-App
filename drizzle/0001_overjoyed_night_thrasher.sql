CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`oldValues` json,
	`newValues` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lgas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`state` varchar(255) NOT NULL,
	`code` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lgas_id` PRIMARY KEY(`id`),
	CONSTRAINT `lgas_name_unique` UNIQUE(`name`),
	CONSTRAINT `lgas_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('payment_confirmation','payment_failure','daily_summary','system_alert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` text,
	`contactDetails` varchar(255),
	`taxpayerId` varchar(50),
	`lgaId` int NOT NULL,
	`payerType` enum('individual','business','organization') NOT NULL DEFAULT 'individual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payers_id` PRIMARY KEY(`id`),
	CONSTRAINT `payers_taxpayerId_unique` UNIQUE(`taxpayerId`)
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`receiptNumber` varchar(50) NOT NULL,
	`pdfUrl` text,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`downloadedAt` timestamp,
	`downloadCount` int DEFAULT 0,
	CONSTRAINT `receipts_id` PRIMARY KEY(`id`),
	CONSTRAINT `receipts_transactionId_unique` UNIQUE(`transactionId`),
	CONSTRAINT `receipts_receiptNumber_unique` UNIQUE(`receiptNumber`)
);
--> statement-breakpoint
CREATE TABLE `revenue_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`amountType` enum('fixed','variable') NOT NULL,
	`fixedAmount` decimal(12,2),
	`calculationLogic` text,
	`applicableLgas` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revenue_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transaction_status_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`oldStatus` enum('pending','paid','failed'),
	`newStatus` enum('pending','paid','failed') NOT NULL,
	`changedBy` int NOT NULL,
	`reason` text,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transaction_status_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payerId` int NOT NULL,
	`revenueCategoryId` int NOT NULL,
	`amountDue` decimal(12,2) NOT NULL,
	`amountPaid` decimal(12,2) DEFAULT '0.00',
	`status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
	`paymentReference` varchar(100),
	`remitaRRR` varchar(50),
	`collectorId` int NOT NULL,
	`lgaId` int NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidAt` timestamp,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('Super Admin','LGA Admin','Revenue Collector','Auditor') NOT NULL DEFAULT 'Revenue Collector';--> statement-breakpoint
ALTER TABLE `users` ADD `lgaId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;