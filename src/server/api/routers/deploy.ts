import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
// import { posts } from "~/server/db/schema";

const deploysMock = [
  {
    id: 1,
    name: "jeira-frontend",
    domains: ["www.marks.com.br", "marks.com.br"],
    version: "1.2",
    hasCertificate: true,
  },
  {
    id: 2,
    name: "jeira-api",
    domains: ["api.marks.com.br"],
    version: "1.3",
    hasCertificate: true,
  },
  {
    id: 3,
    name: "quimeraej",
    domains: ["quimeraej.com", "www.quimeraej.com"],
    version: "2.2",
    hasCertificate: false,
  },
  {
    id: 4,
    name: "struct",
    domains: [
      "structej.com",
      "www.structej.com",
      "struct.unb.br",
      "www.struct.unb.br",
    ],
    version: "2.2",
    hasCertificate: false,
  },
  {
    id: 5,
    name: "reminder",
    domains: ["reminder.structej.com"],
    version: "2.2",
    hasCertificate: false,
  },
  {
    id: 5,
    name: "docs",
    domains: ["docs.structej.com"],
    version: "2.2",
    hasCertificate: false,
  },
];

export const deployRouter = createTRPCRouter({
  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     await ctx.db.insert(posts).values({
  //       name: input.name,
  //       createdById: ctx.session.user.id,
  //     });
  //   }),

  // getLatest: publicProcedure.query(({ ctx }) => {
  //   return ctx.db.query.posts.findFirst({
  //     orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  //   });
  // }),

  get: protectedProcedure.input(z.number()).query(({ input }) => {
    return deploysMock.find((d) => d.id === input);
  }),

  getAll: protectedProcedure.query(() => {
    return deploysMock;
  }),
});
