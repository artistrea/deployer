import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";
import { registerService } from "~/utils/registerService";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = registerService("mysqlTable", () => {
  return mysqlTableCreator((name) => `deployer_${name}`);
});

export const deploys = mysqlTable("deploy", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  name: varchar("name", { length: 64 }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const deploysRelations = relations(deploys, ({ many }) => ({
  domains: many(deployDomains),
  services: many(services),
}));

export const deployDomains = mysqlTable("deployDomain", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  value: varchar("value", { length: 64 }),
  deployId: bigint("deployId", { mode: "number" }).notNull(),
});

export const deployDomainsRelations = relations(deployDomains, ({ one }) => ({
  deploy: one(deploys, {
    fields: [deployDomains.deployId],
    references: [deploys.id],
  }),
}));

export const services = mysqlTable("service", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  name: varchar("name", { length: 32 }).notNull(),
  dockerImage: varchar("dockerImage", { length: 64 }).notNull(),
  hasInternalNetwork: boolean("hasInternalNetwork").notNull().default(false),
  deployId: bigint("deployId", { mode: "number" }).notNull(),
});

export const servicesRelations = relations(services, ({ one, many }) => ({
  deploy: one(deploys, {
    fields: [services.deployId],
    references: [deploys.id],
  }),
  exposedConfig: one(exposedConfigs),
  dependsOn: many(serviceDependsOn, { relationName: "dependantOn" }),
  dependedBy: many(serviceDependsOn, { relationName: "dependedBy" }),
  environmentVariables: many(environmentVariables),
  volumes: many(serviceVolumes),
}));

export const exposedConfigs = mysqlTable("exposedConfig", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  serviceId: bigint("serviceId", { mode: "number" }).notNull().unique(),
  rule: varchar("rule", { length: 256 }).notNull(),
  port: int("port"),
});

export const exposedConfigsRelations = relations(exposedConfigs, ({ one }) => ({
  certificate: one(certificates),
  service: one(services, {
    fields: [exposedConfigs.serviceId],
    references: [services.id],
  }),
}));

export const certificates = mysqlTable("certificate", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  name: varchar("name", { length: 32 }).notNull(),
  forDomain: varchar("forDomain", { length: 64 }).notNull(),
  exposedConfigId: bigint("exposedConfigId", { mode: "number" })
    .notNull()
    .unique(),
});

export const certificatesRelations = relations(
  certificates,
  ({ one, many }) => ({
    exposedConfig: one(exposedConfigs, {
      fields: [certificates.exposedConfigId],
      references: [exposedConfigs.id],
    }),
    forSubDomains: many(certificateSubDomains),
  }),
);

export const certificateSubDomains = mysqlTable("certificateSubDomain", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  value: varchar("value", { length: 64 }).notNull(),
  certificateId: bigint("certificateId", { mode: "number" }).notNull().unique(),
});

export const certificateSubDomainsRelations = relations(
  certificateSubDomains,
  ({ one }) => ({
    exposedConfig: one(certificates, {
      fields: [certificateSubDomains.certificateId],
      references: [certificates.id],
    }),
  }),
);

export const environmentVariables = mysqlTable("environmentVariable", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  serviceId: bigint("serviceId", { mode: "number" }).notNull(),
  key: varchar("key", { length: 64 }).notNull(),
  value: varchar("value", { length: 256 }).notNull(),
});

export const environmentVariablesRelations = relations(
  environmentVariables,
  ({ one }) => ({
    service: one(services, {
      fields: [environmentVariables.serviceId],
      references: [services.id],
    }),
  }),
);

export const serviceDependsOn = mysqlTable("serviceDependsOn", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  dependantId: bigint("dependantId", { mode: "number" }).notNull(),
  dependsOnId: bigint("dependsOnId", { mode: "number" }).notNull(),
});

export const serviceDependsOnRelations = relations(
  serviceDependsOn,
  ({ one }) => ({
    dependant: one(services, {
      fields: [serviceDependsOn.dependantId],
      references: [services.id],
      relationName: "dependantOn",
    }),
    dependsOn: one(services, {
      fields: [serviceDependsOn.dependsOnId],
      references: [services.id],
      relationName: "dependedBy",
    }),
  }),
);

export const serviceVolumes = mysqlTable("serviceVolume", {
  id: bigint("id", { mode: "number" }).notNull().primaryKey().autoincrement(),
  value: varchar("value", { length: 256 }).notNull(),
  serviceId: bigint("serviceId", { mode: "number" }).notNull(),
});

export const serviceVolumesRelations = relations(serviceVolumes, ({ one }) => ({
  service: one(services, {
    fields: [serviceVolumes.serviceId],
    references: [services.id],
  }),
}));

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = mysqlTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);
