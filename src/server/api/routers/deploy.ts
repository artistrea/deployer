import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { parse } from "yaml";
// import { posts } from "~/server/db/schema";

const deploysMock = [
  {
    id: 1,
    name: "Site Struct",
    description: "Frontend em react, backend em rails + postgresql.",
    domains: [
      "structej.com",
      "www.structej.com",
      "struct.unb.br",
      "www.struct.unb.br",
    ],
    services: [
      {
        name: "site-struct-front",
        exposed: true,
        image: {
          repo: "structej/projetos",
          name: "site-struct-front",
          version: "1.3",
        },
        template: "static-asset-server",
        certificate: {
          forDomain: "struct.unb.br",
          forSubDomains: ["www.struct.unb.br"],
        },
        rule: "Host(`structej.com`, `www.structej.com`, `struct.unb.br`, `www.struct.unb.br`) && !PathPrefix(`/api`) && !PathPrefix(`/rails`)",
        port: undefined,
      },
      {
        name: "site-struct-api",
        exposed: true,
        image: {
          repo: "structej/projetos",
          name: "site-struct-api",
          version: "1.3",
        },
        template: "rails",
        rule: "Host(`structej.com`) && ( PathPrefix(`/rails`) || PathPrefix(`/api`) )",
        port: 3000,
        depends_on: ["db"],
        environment: [
          {
            id: 1,
            key: "STRUCT_DATABASE",
            value: "site_struct_db",
          },
          {
            id: 2,
            key: "STRUCT_DATABASE_USERNAME",
            value: "struct",
          },
          {
            id: 3,
            key: "STRUCT_DATABASE_PASSWORD",
            value: "paodestruct",
          },
          {
            id: 4,
            key: "MAILJET_API_KEY",
            value: "a660b332fc22ab43f1adb5a3607639e4",
          },
          {
            id: 5,
            key: "MAILJET_SECRET_KEY",
            value: "f03833998f6cee3b3f901bd50486e835",
          },
          {
            id: 6,
            key: "SECRET_KEY_BASE",
            value:
              "b8972552ac6fe685cb8b11f3867e5e4046a03bb005801b916744f43b612194716d60110ab91af6c6db0d0715d901657935d3044bd2368ac315885926640ca048",
          },
          {
            id: 7,
            key: "CONTACT_EMAIL",
            value: "comercial@struct.unb.br",
          },
        ],
      },
      {
        name: "db",
        exposed: false,
        image: {
          repo: "postgres",
          name: "10.4-alpine",
          version: "",
        },
        environment: [
          {
            id: 1,
            key: "POSTGRES_DB",
            value: "site_struct_db",
          },
          {
            id: 2,
            key: "POSTGRES_USER",
            value: "struct",
          },
          {
            id: 3,
            key: "POSTGRES_PASSWORD",
            value: "paodestruct",
          },
        ],
        template: "psql-database",
      },
    ],
  },
];

function parseDockerCompose(dockerComposeYML: string) {
  const obj = parse(dockerComposeYML);

  console.log("obj", JSON.stringify(obj, null, 2));
}

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
