import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { deploys } from "~/server/db/schema";
import { createDeploySchema } from "~/validations/createDeploy";

export const deployRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createDeploySchema)
    .mutation(async ({ ctx, input }) => {
      return (
        await ctx.db.insert(deploys).values({
          name: input.deploy.name,
          description: input.deploy.description,
          domains: input.domains,
          services: input.services,
        })
      )[0].insertId;
    }),

  get: protectedProcedure.input(z.number()).query(({ input, ctx }) => {
    return ctx.db.query.deploys.findFirst({
      where: ({ id }, { eq }) => eq(id, input),
      columns: {
        name: true,
        description: true,
        domains: true,
        services: true,
      },
    });
  }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.query.deploys.findMany({
      columns: {
        id: true,
        name: true,
        domains: true,
      },
    });
  }),
});
