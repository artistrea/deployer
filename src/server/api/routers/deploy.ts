import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  certificateSubDomains,
  certificates,
  deployDomains,
  deploys,
  environmentVariables,
  exposedConfigs,
  serviceDependsOn,
  services,
} from "~/server/db/schema";
import { createDeploySchema } from "~/validations/createDeploy";

function filterOutFalse<T>(arr: (T | false | undefined)[]): T[] {
  return arr.filter((it) => !!it) as T[];
}

export const deployRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createDeploySchema)
    .mutation(async ({ ctx, input }) => {
      // using transaction so that changes rollback if something goes wrong
      return await ctx.db.transaction(async (tx) => {
        const deployId = (await tx.insert(deploys).values(input.deploy))[0]
          .insertId;

        await tx
          .insert(deployDomains)
          .values(input.deployDomains.map((d) => ({ ...d, deployId })));

        // careful when getting the first id and ++ing to the rest
        // concurrency may fuck it up, unless db engine locks during insert
        // may consider doing individual inserts using Promise.all
        const firstServiceId = (
          await tx.insert(services).values(
            input.services.map((s) => ({
              deployId,
              dockerImage: s.dockerImage,
              name: s.name,
              hasInternalNetwork: s.hasInternalNetwork,
            })),
          )
        )[0].insertId;

        const environmentVariablesToInsert = input.services.flatMap((s, i) =>
          s.environmentVariables.map((e) => ({
            serviceId: firstServiceId + i,
            key: e.key,
            value: e.value,
          })),
        );

        await tx
          .insert(environmentVariables)
          .values(environmentVariablesToInsert);

        const dependsOnToInsert = input.services.flatMap((s, i) => {
          if (!s.hasInternalNetwork) return [];
          if (s.dependsOn === "") return [];
          const dependsOnId =
            firstServiceId +
            input.services.findIndex((s2) => s2.name === s.dependsOn);

          if (dependsOnId < firstServiceId)
            throw new TRPCError({
              code: "UNPROCESSABLE_CONTENT",
              message: `Service ${s.name} depends on ${s.dependsOn}, but it does not exist!`,
            });

          return [
            {
              dependantId: firstServiceId + i,
              dependsOnId,
            },
          ];
        });

        await tx.insert(serviceDependsOn).values(dependsOnToInsert);

        const configsToInsert = input.services.flatMap((s, i) =>
          s.hasExposedConfig
            ? [
                {
                  serviceId: firstServiceId + i,
                  rule: s.exposedConfig.rule,
                  port: s.exposedConfig.port,
                },
              ]
            : [],
        );

        const firstConfigId = (
          await tx.insert(exposedConfigs).values(configsToInsert)
        )[0].insertId;

        const configsWithCert = filterOutFalse(
          input.services
            .filter((s) => s.hasExposedConfig)
            .map(
              (s, i) =>
                s.hasExposedConfig && {
                  ...s.exposedConfig,
                  id: firstConfigId + i,
                },
            ),
        );

        type ConfigsWithCert = ((typeof configsWithCert)[number] & {
          hasCertificate: true;
        })[];

        const firstCertificateId = (
          await tx.insert(certificates).values(
            (configsWithCert as ConfigsWithCert).map((c) => ({
              exposedConfigId: c.id,
              name: c.certificate.name,
              forDomain: c.certificate.forDomain,
            })),
          )
        )[0].insertId;

        const certsWithId = (configsWithCert as ConfigsWithCert).map(
          (c, i) => ({
            ...c.certificate,
            id: firstCertificateId + i,
          }),
        );

        await tx.insert(certificateSubDomains).values(
          certsWithId.flatMap((cert) =>
            cert.forSubDomains.map((sub) => ({
              certificateId: cert.id,
              value: sub.value,
            })),
          ),
        );

        return deployId;
      });
    }),

  get: protectedProcedure.input(z.number()).query(({ input, ctx }) => {
    return ctx.db.query.deploys.findFirst({
      where: ({ id }, { eq }) => eq(id, input),
      columns: {
        name: true,
        description: true,
      },
      with: {
        domains: true,
        services: {
          with: {
            dependsOn: true,
            environmentVariables: true,
            exposedConfig: {
              with: {
                certificate: {
                  with: {
                    forSubDomains: true,
                  },
                },
              },
            },
            volumes: true,
          },
        },
      },
    });
  }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.deploys.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
      },
      with: {
        domains: true,
      },
    });
  }),
});
