import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
// import { posts } from "~/server/db/schema";

type Service = {
  name: string;
  exposedConfig?: {
    rule: string;
    port?: number;
    certificate?: {
      name: string;
      forDomain: string;
      forSubDomains: string[];
    };
  };
  image: {
    repo: string;
    name: string;
    version: string;
  };
  dependsOn?: string[];
  networks: ("proxy" | "internal")[];
  environment?: {
    key: string;
    value: string;
  }[];
  volumes?: string[];
};

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
        exposedConfig: {
          certificate: {
            name: "struct-certresolver",
            forDomain: "struct.unb.br",
            forSubDomains: ["www.struct.unb.br", "www.struct.unb.br"],
          },
          rule: "Host(`structej.com`, `www.structej.com`, `struct.unb.br`, `www.struct.unb.br`) && !PathPrefix(`/api`) && !PathPrefix(`/rails`)",
        },
        image: {
          repo: "structej/projetos",
          name: "site-struct-front",
          version: "1.3",
        },
        networks: ["proxy"],
      },
      {
        name: "site-struct-api",
        dependsOn: ["db"],
        exposedConfig: {
          rule: "Host(`structej.com`) && ( PathPrefix(`/rails`) || PathPrefix(`/api`) )",
          port: 3000,
        },
        image: {
          repo: "structej/projetos",
          name: "site-struct-api",
          version: "1.3",
        },
        environment: [
          {
            key: "STRUCT_DATABASE",
            value: "site_struct_db",
          },
          {
            key: "STRUCT_DATABASE_USERNAME",
            value: "struct",
          },
          {
            key: "STRUCT_DATABASE_PASSWORD",
            value: "paodestruct",
          },
          {
            key: "MAILJET_API_KEY",
            value: "a660b332fc22ab43f1adb5a3607639e4",
          },
          {
            key: "MAILJET_SECRET_KEY",
            value: "f03833998f6cee3b3f901bd50486e835",
          },
          {
            key: "SECRET_KEY_BASE",
            value:
              "b8972552ac6fe685cb8b11f3867e5e4046a03bb005801b916744f43b612194716d60110ab91af6c6db0d0715d901657935d3044bd2368ac315885926640ca048",
          },
          {
            key: "CONTACT_EMAIL",
            value: "comercial@struct.unb.br",
          },
        ],
        networks: ["proxy", "internal"],
        volumes: ["project_data:/app/storage/"],
      },
      {
        name: "db",
        networks: ["internal"],
        image: {
          repo: "postgres",
          name: "10.4-alpine",
          version: "",
        },
        environment: [
          {
            key: "POSTGRES_DB",
            value: "site_struct_db",
          },
          {
            key: "POSTGRES_USER",
            value: "struct",
          },
          {
            key: "POSTGRES_PASSWORD",
            value: "paodestruct",
          },
          {
            key: "PGDATA",
            value: "/var/lib/postgresql/data/",
          },
        ],
        volumes: ["pg_data:/var/lib/postgresql/data/"],
      },
    ] satisfies Service[],
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
