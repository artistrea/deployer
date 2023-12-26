import { z } from "zod";

const exposedConfigSchema = z.union([
  z.object({
    rule: z.string().min("Host(``)".length).max(256),
    port: z.number().optional(),
    hasCertificate: z.literal(false),
  }),
  z.object({
    rule: z.string().min("Host(``)".length).max(256),
    port: z.number().optional(),
    hasCertificate: z.literal(true),
    certificate: z.object({
      name: z.string().min(1).max(32),
      forDomain: z.string().min(1).max(64),
      forSubDomains: z.array(
        z.object({
          value: z.string().min(1).max(64),
        }),
      ),
    }),
  }),
]);

const serviceSchema = z.union([
  z.object({
    name: z.string().min(1).max(32),
    dockerImage: z.string().min(1).max(64),
    hasInternalNetwork: z.literal(false),
    hasExposedConfig: z.literal(false),
    environmentVariables: z.array(
      z.object({
        key: z.string().min(1).max(64),
        value: z.string().min(1).max(256),
      }),
    ),
  }),
  z.object({
    name: z.string().min(1).max(32),
    dockerImage: z.string().min(1).max(64),
    hasInternalNetwork: z.literal(true),
    dependsOn: z.string().max(32).optional(),
    hasExposedConfig: z.literal(false),
    environmentVariables: z.array(
      z.object({
        key: z.string().min(1).max(64),
        value: z.string().min(1).max(256),
      }),
    ),
  }),
  z.object({
    name: z.string().min(1).max(32),
    dockerImage: z.string().min(1).max(64),
    hasInternalNetwork: z.literal(false),
    hasExposedConfig: z.literal(true),
    exposedConfig: exposedConfigSchema,
    environmentVariables: z.array(
      z.object({
        key: z.string().min(1).max(64),
        value: z.string().min(1).max(256),
      }),
    ),
  }),
  z.object({
    name: z.string().min(1).max(32),
    dockerImage: z.string().min(1).max(64),
    hasInternalNetwork: z.literal(true),
    dependsOn: z.string().max(32).optional(),
    hasExposedConfig: z.literal(true),
    exposedConfig: exposedConfigSchema,
    environmentVariables: z.array(
      z.object({
        key: z.string().min(1).max(64),
        value: z.string().min(1).max(256),
      }),
    ),
  }),
]);

export const createDeploySchema = z.object({
  deploy: z.object({
    name: z.string().min(1).max(64),
    description: z.string().min(1).max(65535),
  }),
  deployDomains: z.array(z.object({ value: z.string().min(1).max(64) })),
  services: z.array(serviceSchema).min(1),
});

export type CreateDeploySchema = z.infer<typeof createDeploySchema>;
