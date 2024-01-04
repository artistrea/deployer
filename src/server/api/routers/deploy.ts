import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { deployTextFiles, deploys } from "~/server/db/schema";
import type { RouterInputs } from "~/utils/api";
import { createDeploySchema } from "~/validations/createDeploy";

export const deployRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createDeploySchema)
    .mutation(async ({ ctx, input }) => {
      const deployId = (
        await ctx.db.insert(deploys).values({
          name: input.deploy.name,
          description: input.deploy.description,
          domains: input.domains,
        })
      )[0].insertId;

      const dockerComposeFileText = generateDockerComposeTemplate(input);

      await ctx.db.insert(deployTextFiles).values({
        deployId,
        description:
          "Este arquivo deve ser colocado no servidor, e é ele que faz o deploy realmente acontecer. Ao rodar 'docker compose up -d' na pasta com este arquivo, o site estará no ar",
        content: dockerComposeFileText,
        directory: `server/docker_compose_struct/${input.deploy.name}`,
        name: "docker-compose.yml",
      });

      return deployId;
    }),

  get: protectedProcedure.input(z.number()).query(async ({ input, ctx }) => {
    const deploy = await ctx.db.query.deploys.findFirst({
      where: ({ id }, { eq }) => eq(id, input),
      columns: {
        name: true,
        description: true,
        domains: true,
      },
      with: {
        files: true,
      },
    });

    return deploy;
  }),

  getDomainsWithStatus: protectedProcedure
    .input(z.array(z.object({ value: z.string() })).optional())
    .query(async ({ input }) => {
      if (typeof input === "undefined") return;

      return await Promise.all(
        input.map(async (d) => {
          return {
            ...d,
            status: await fetch(`https://${d.value}`)
              .then((res) => res.status)
              .catch(() => 500),
          };
        }),
      );
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

type Deploy = NonNullable<RouterInputs["deploy"]["create"]>;

function serviceTemplate(service: Deploy["services"][number]) {
  return `
  ${service.name}:
    image: ${service.dockerImage}
    restart: always
    networks:${
      !service.hasInternalNetwork
        ? ""
        : `
      - internal`
    }${
      !service.hasExposedConfig
        ? ""
        : `
      - proxy`
    }${
      !service.hasInternalNetwork || !service.dependsOn
        ? ""
        : `
    depends_on:
      - ${service.dependsOn}
    )}`
    }${
      !service.volumes.length
        ? ""
        : `
    volumes:${service.volumes.reduce(
      (pr, volume) => `${pr}
      - ${volume.value}`,
      "",
    )}`
    }${
      !service.environmentVariables.length
        ? ""
        : `
    environment:${service.environmentVariables.reduce(
      (prev, k) => `${prev}
      ${k.key}: ${k.value}`,
      "",
    )}`
    }${
      !service.hasExposedConfig
        ? ""
        : `
    labels:
      - traefik.enable=true
      - traefik.docker.network=proxy

      # # http access
      - traefik.http.routers.${service.name}-router.rule=${
        service.exposedConfig.rule
      }
      - traefik.http.routers.${service.name}-router.entrypoints=web

      # # https access

      - traefik.http.routers.${service.name}-router-websecure.rule=${
        service.exposedConfig.rule
      }
      - traefik.http.routers.${
        service.name
      }-router-websecure.entrypoints=websecure
      - traefik.http.routers.${service.name}-router-websecure.tls=true
${
  !service.exposedConfig.port
    ? ""
    : `
      # # Specify to container port
      - traefik.http.routers.${service.name}-router-websecure.service=${service.name}-router-service
      - traefik.http.routers.${service.name}-router.service=${service.name}-router-service
      - traefik.http.services.${service.name}-router-service.loadbalancer.server.port=${service.exposedConfig.port}
`
}
      # # redirect http to https

      - traefik.http.middlewares.${
        service.name
      }-router-redirect-to-websecure.redirectscheme.scheme=https
      - traefik.http.routers.${service.name}-router.middlewares=${
        service.name
      }-router-redirect-to-websecure
${
  !service.exposedConfig.hasCertificate
    ? ""
    : `
      # # certResolver pra quando precisar gerar certificado por aqui:
      # # Ver traefik.yml para ver a configuracao do challenge:
      
      - traefik.http.routers.${
        service.name
      }-router-websecure.tls.certResolver=${
        service.exposedConfig.certificate.name
      }
      
      # # Domains that need certificate:
      - traefik.http.routers.${
        service.name
      }-router-websecure.tls.domains[0].main=${
        service.exposedConfig.certificate.forDomain
      }${
        !service.exposedConfig.certificate.forSubDomains.length
          ? ""
          : `
      - traefik.http.routers.${
        service.name
      }-router-websecure.tls.domains[0].sans=${service.exposedConfig.certificate.forSubDomains.join(
        ",",
      )}`
      }`
}`
    }
`;
}

function generateDockerComposeTemplate(
  deploy: RouterInputs["deploy"]["create"],
) {
  let allVolumes = deploy.services.flatMap((s) =>
    s.volumes
      .map((vol) => vol.value.substring(0, vol.value.indexOf(":")))
      .filter((v) => !v.startsWith("./") && !v.startsWith("/")),
  );

  allVolumes = allVolumes.filter((v, i) => allVolumes.indexOf(v) === i);

  return `version: "3.3"

networks:
  internal:
    external: false
  # traefik network:
  proxy:
    external: true

services:${deploy.services.map((s) => serviceTemplate(s)).join("")}
${
  !allVolumes.length
    ? ""
    : `
volumes:${allVolumes.reduce(
        (pr, volume) => `${pr}
  ${volume}:`,
        "",
      )}
`
}
`;
}
