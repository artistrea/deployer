import { db } from "./index";
import {
  certificateSubDomains,
  certificates,
  deployDomains,
  deploys,
  environmentVariables,
  exposedConfigs,
  serviceVolumes,
  services,
} from "./schema";

async function seed() {
  const deployId = (
    await db.insert(deploys).values({
      name: "Site Struct",
      description: "Frontend em react, backend em rails + postgresql.",
    })
  )[0].insertId;

  await db.insert(deployDomains).values([
    {
      value: "structej.com",
      deployId,
    },
    {
      value: "struct.unb.br",
      deployId,
    },
    {
      value: "www.struct.unb.br",
      deployId,
    },
  ]);

  const firstServiceId = (
    await db.insert(services).values([
      {
        deployId,
        name: "site-struct-front",
        dockerImage: "structej/projetos/site-struct-front-1.5",
      },
      {
        deployId,
        name: "site-struct-api",
        dockerImage: "structej/projetos/site-struct-api-1.3",
        hasInternalNetwork: true,
      },
      {
        deployId,
        name: "db",
        dockerImage: "structej/projetos/site-struct-api-1.3",
        hasInternalNetwork: true,
      },
    ])
  )[0].insertId;

  const firstConfigId = (
    await db.insert(exposedConfigs).values([
      {
        serviceId: firstServiceId,
        rule: "Host(`structej.com`, `www.structej.com`, `struct.unb.br`, `www.struct.unb.br`) && !PathPrefix(`/api`) && !PathPrefix(`/rails`)",
      },
      {
        serviceId: firstServiceId + 1,
        rule: "Host(`structej.com`) && ( PathPrefix(`/rails`) || PathPrefix(`/api`) )",
        port: 3000,
      },
    ])
  )[0].insertId;

  const certificateId = (
    await db.insert(certificates).values({
      exposedConfigId: firstConfigId,
      forDomain: "struct.unb.br",
      name: "struct-certresolver",
    })
  )[0].insertId;

  await db.insert(certificateSubDomains).values({
    certificateId,
    value: "www.struct.unb.br",
  });

  await db.insert(environmentVariables).values([
    {
      serviceId: firstServiceId + 1,
      key: "STRUCT_DATABASE",
      value: "site_struct_db",
    },
    {
      serviceId: firstServiceId + 1,
      key: "STRUCT_DATABASE_USERNAME",
      value: "struct",
    },
    {
      serviceId: firstServiceId + 1,
      key: "STRUCT_DATABASE_PASSWORD",
      value: "paodestruct",
    },
    {
      serviceId: firstServiceId + 1,
      key: "MAILJET_API_KEY",
      value: "a660b332fc22ab43f1adb5a3607639e4",
    },
    {
      serviceId: firstServiceId + 1,
      key: "MAILJET_SECRET_KEY",
      value: "f03833998f6cee3b3f901bd50486e835",
    },
    {
      serviceId: firstServiceId + 1,
      key: "SECRET_KEY_BASE",
      value:
        "b8972552ac6fe685cb8b11f3867e5e4046a03bb005801b916744f43b612194716d60110ab91af6c6db0d0715d901657935d3044bd2368ac315885926640ca048",
    },
    {
      serviceId: firstServiceId + 1,
      key: "CONTACT_EMAIL",
      value: "comercial@struct.unb.br",
    },
    {
      serviceId: firstServiceId + 2,
      key: "POSTGRES_DB",
      value: "site_struct_db",
    },
    {
      serviceId: firstServiceId + 2,
      key: "POSTGRES_USER",
      value: "struct",
    },
    {
      serviceId: firstServiceId + 2,
      key: "POSTGRES_PASSWORD",
      value: "paodestruct",
    },
    {
      serviceId: firstServiceId + 2,
      key: "PGDATA",
      value: "/var/lib/postgresql/data/",
    },
  ]);

  await db.insert(serviceVolumes).values([
    {
      serviceId: firstServiceId + 1,
      value: "project_data:/app/storage/",
    },
    {
      serviceId: firstServiceId + 2,
      value: "pg_data:/var/lib/postgresql/data/",
    },
  ]);
}

seed()
  .then(() => console.log("seed done"))
  .catch((err) => console.log(err));
