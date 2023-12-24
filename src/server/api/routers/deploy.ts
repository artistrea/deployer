import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const deployRouter = createTRPCRouter({
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
