import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
// import { posts } from "~/server/db/schema";

type Deploy = {
  id: number;
  name: string;
  description: string;
  domains: DeployDomain[];
  services: Service[];
};

type DeployDomain = {
  id: number;
  deployId: number;
  value: string;
};

type ExposedConfig = {
  id: number;
  serviceId: number;
  rule: string;
  port?: number;
  certificate?: Certificate;
};

type Certificate = {
  id: number;
  name: string;
  forDomain: string;
  forSubDomains: CertificateSubDomain[];
};

type CertificateSubDomain = {
  id: number;
  certificateId: number;
  value: string;
};

type EnvironmentVariable = {
  id: number;
  serviceId: number;
  key: string;
  value: string;
};

type Service = {
  id: number;
  deployId: number;
  name: string;
  exposedConfig?: ExposedConfig;
  dockerImage: string;
  dependsOn?: ServiceDependsOn[];
  hasInternalNetwork?: boolean;
  environmentVariables?: EnvironmentVariable[];
  volumes?: ServiceVolumes[];
};

type ServiceDependsOn = {
  id: number;
  dependantId: number;
  dependsOnId: number;
};

type ServiceVolumes = {
  id: number;
  serviceId: number;
  value: string;
};

const deploysMock = [
  {
    id: 1,
    name: "Site Struct",
    description: "Frontend em react, backend em rails + postgresql.",
    domains: [
      {
        id: 1,
        value: "structej.com",
        deployId: 1,
      },
      {
        id: 2,
        value: "struct.unb.br",
        deployId: 1,
      },
      {
        id: 3,
        value: "www.struct.unb.br",
        deployId: 1,
      },
    ],
    services: [
      {
        id: 1,
        deployId: 1,
        name: "site-struct-front",
        exposedConfig: {
          id: 1,
          serviceId: 1,
          certificate: {
            id: 1,
            name: "struct-certresolver",
            forDomain: "struct.unb.br",
            forSubDomains: [
              {
                id: 1,
                certificateId: 1,
                value: "www.struct.unb.br",
              },
            ],
          },
          rule: "Host(`structej.com`, `www.structej.com`, `struct.unb.br`, `www.struct.unb.br`) && !PathPrefix(`/api`) && !PathPrefix(`/rails`)",
        },
        dockerImage: "structej/projetos/site-struct-front-1.3",
        hasInternalNetwork: false,
      },
      {
        name: "site-struct-api",
        id: 2,
        deployId: 1,
        dependsOn: [
          {
            id: 1,
            dependantId: 2,
            dependsOnId: 3,
          },
        ],
        exposedConfig: {
          id: 2,
          serviceId: 2,
          rule: "Host(`structej.com`) && ( PathPrefix(`/rails`) || PathPrefix(`/api`) )",
          port: 3000,
        },
        dockerImage: "structej/projetos:site-struct-api-1.3",
        environmentVariables: [
          {
            id: 1,
            serviceId: 2,
            key: "STRUCT_DATABASE",
            value: "site_struct_db",
          },
          {
            id: 2,
            serviceId: 2,
            key: "STRUCT_DATABASE_USERNAME",
            value: "struct",
          },
          {
            id: 3,
            serviceId: 2,
            key: "STRUCT_DATABASE_PASSWORD",
            value: "paodestruct",
          },
          {
            id: 4,
            serviceId: 2,
            key: "MAILJET_API_KEY",
            value: "a660b332fc22ab43f1adb5a3607639e4",
          },
          {
            id: 5,
            serviceId: 2,
            key: "MAILJET_SECRET_KEY",
            value: "f03833998f6cee3b3f901bd50486e835",
          },
          {
            id: 6,
            serviceId: 2,
            key: "SECRET_KEY_BASE",
            value:
              "b8972552ac6fe685cb8b11f3867e5e4046a03bb005801b916744f43b612194716d60110ab91af6c6db0d0715d901657935d3044bd2368ac315885926640ca048",
          },
          {
            id: 7,
            serviceId: 2,
            key: "CONTACT_EMAIL",
            value: "comercial@struct.unb.br",
          },
        ],
        hasInternalNetwork: true,
        volumes: [
          {
            id: 1,
            serviceId: 2,
            value: "project_data:/app/storage/",
          },
        ],
      },
      {
        id: 3,
        name: "db",
        deployId: 1,
        dockerImage: "postgres:10.4-alpine",
        environmentVariables: [
          {
            id: 8,
            serviceId: 3,
            key: "POSTGRES_DB",
            value: "site_struct_db",
          },
          {
            id: 9,
            serviceId: 3,
            key: "POSTGRES_USER",
            value: "struct",
          },
          {
            id: 10,
            serviceId: 3,
            key: "POSTGRES_PASSWORD",
            value: "paodestruct",
          },
          {
            id: 11,
            serviceId: 3,
            key: "PGDATA",
            value: "/var/lib/postgresql/data/",
          },
        ],
        hasInternalNetwork: true,
        volumes: [
          {
            id: 2,
            serviceId: 3,
            value: "pg_data:/var/lib/postgresql/data/",
          },
        ],
      },
    ],
  },
] satisfies Deploy[];

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
