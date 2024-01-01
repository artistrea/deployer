import {
  createDeploySchema,
  type CreateDeploySchema,
} from "~/validations/createDeploy";
import { db } from "./index";
import { deploys } from "./schema";

async function seed() {
  const deployToValidate: CreateDeploySchema = {
    deploy: {
      name: "Site Struct",
      description: "Frontend em react, backend em rails + postgresql.",
    },
    domains: [
      { value: "structej.com" },
      { value: "struct.unb.br" },
      { value: "www.struct.unb.br" },
    ],
    services: [
      {
        name: "site-struct-front",
        dockerImage: "structej/projetos/site-struct-front-1.5",
        hasExposedConfig: true,
        hasInternalNetwork: false,
        environmentVariables: [],
        volumes: [],
        exposedConfig: {
          rule: "Host(`structej.com`, `www.structej.com`, `struct.unb.br`, `www.struct.unb.br`) && !PathPrefix(`/api`) && !PathPrefix(`/rails`)",
          hasCertificate: true,
          certificate: {
            name: "struct-certresolver",
            forDomain: "struct.unb.br",
            forSubDomains: [{ value: "www.struct.unb.br" }],
          },
        },
      },
      {
        name: "site-struct-api",
        dockerImage: "structej/projetos/site-struct-api-1.3",
        hasInternalNetwork: true,
        hasExposedConfig: true,
        environmentVariables: [
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
        volumes: [{ value: "project_data:/app/storage/" }],
        exposedConfig: {
          rule: "Host(`structej.com`) && ( PathPrefix(`/rails`) || PathPrefix(`/api`) )",
          port: 3000,
          hasCertificate: false,
        },
      },
      {
        name: "db",
        dockerImage: "postgres:10.4-alpine",
        hasExposedConfig: false,
        hasInternalNetwork: true,
        volumes: [{ value: "pg_data:/var/lib/postgresql/data/" }],
        environmentVariables: [
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
      },
    ],
  };

  const result = createDeploySchema.safeParse(deployToValidate);

  if (!result.success) throw new Error("Não pode criar o deploy");

  await db.insert(deploys).values({
    name: result.data.deploy.name,
    description: result.data.deploy.description,
    domains: result.data.domains,
    services: result.data.services,
  });
}

seed()
  .then(() => console.log("seed done"))
  .catch((err) => console.log(err));
