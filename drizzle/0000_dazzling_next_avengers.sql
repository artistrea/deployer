CREATE TABLE `deployer_account` (
	`userId` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`providerAccountId` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `deployer_account_provider_providerAccountId` PRIMARY KEY(`provider`,`providerAccountId`)
);

CREATE TABLE `deployer_certificateSubDomain` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`value` varchar(64) NOT NULL,
	`certificateId` bigint NOT NULL,
	CONSTRAINT `deployer_certificateSubDomain_id` PRIMARY KEY(`id`),
	CONSTRAINT `deployer_certificateSubDomain_certificateId_unique` UNIQUE(`certificateId`)
);

CREATE TABLE `deployer_certificate` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(32) NOT NULL,
	`forDomain` varchar(64) NOT NULL,
	`exposedConfigId` bigint NOT NULL,
	CONSTRAINT `deployer_certificate_id` PRIMARY KEY(`id`),
	CONSTRAINT `deployer_certificate_exposedConfigId_unique` UNIQUE(`exposedConfigId`)
);

CREATE TABLE `deployer_deployDomain` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`value` varchar(64),
	`deployId` bigint NOT NULL,
	CONSTRAINT `deployer_deployDomain_id` PRIMARY KEY(`id`)
);

CREATE TABLE `deployer_deploy` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`description` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `deployer_deploy_id` PRIMARY KEY(`id`)
);

CREATE TABLE `deployer_environmentVariable` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`serviceId` bigint NOT NULL,
	`key` varchar(64) NOT NULL,
	`value` varchar(256) NOT NULL,
	CONSTRAINT `deployer_environmentVariable_id` PRIMARY KEY(`id`)
);

CREATE TABLE `deployer_exposedConfig` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`serviceId` bigint NOT NULL,
	`rule` varchar(256) NOT NULL,
	`port` int,
	CONSTRAINT `deployer_exposedConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `deployer_exposedConfig_serviceId_unique` UNIQUE(`serviceId`)
);

CREATE TABLE `deployer_serviceDependsOn` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`dependantId` bigint NOT NULL,
	`dependsOnId` bigint NOT NULL,
	CONSTRAINT `deployer_serviceDependsOn_id` PRIMARY KEY(`id`)
);

CREATE TABLE `deployer_serviceVolume` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`value` varchar(256) NOT NULL,
	`serviceId` bigint NOT NULL,
	CONSTRAINT `deployer_serviceVolume_id` PRIMARY KEY(`id`)
);

CREATE TABLE `deployer_service` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(32) NOT NULL,
	`dockerImage` varchar(64) NOT NULL,
	`hasInternalNetwork` boolean NOT NULL DEFAULT false,
	`deployId` bigint NOT NULL,
	CONSTRAINT `deployer_service_id` PRIMARY KEY(`id`)
);

CREATE TABLE `deployer_session` (
	`sessionToken` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `deployer_session_sessionToken` PRIMARY KEY(`sessionToken`)
);

CREATE TABLE `deployer_user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`emailVerified` timestamp(3) DEFAULT CURRENT_TIMESTAMP(3),
	`image` varchar(255),
	CONSTRAINT `deployer_user_id` PRIMARY KEY(`id`)
);

CREATE TABLE `deployer_verificationToken` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `deployer_verificationToken_identifier_token` PRIMARY KEY(`identifier`,`token`)
);

CREATE INDEX `userId_idx` ON `deployer_account` (`userId`);
CREATE INDEX `userId_idx` ON `deployer_session` (`userId`);