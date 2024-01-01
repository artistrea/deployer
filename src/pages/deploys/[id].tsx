import { useRouter } from "next/router";
import { type RouterOutputs, api } from "~/utils/api";
import Prism from "prismjs";
import "prismjs/components/prism-yaml";
import { useEffect } from "react";
import { Pencil } from "lucide-react";
import { CopyToClipboard } from "~/components/CopyToClipboard";

type Deploy = NonNullable<RouterOutputs["deploy"]["get"]>;

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

function generateDockerComposeTemplate(deploy: RouterOutputs["deploy"]["get"]) {
  if (!deploy) return "";

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

export default function DeployPage() {
  const router = useRouter();

  const { id } = router.query;

  const { data: deploy } = api.deploy.get.useQuery(Number(id), {
    networkMode: "always",
  });

  useEffect(() => {
    Prism.highlightAll();
  }, [deploy]);

  const dockerCompose = generateDockerComposeTemplate(deploy);

  return (
    <section className="min-h-screen flex-col bg-zinc-900 p-8 text-white sm:p-16">
      {deploy ? (
        <>
          <h1 className="text-3xl">{deploy.name}</h1>
          <p className="text-sm text-white/70">{deploy.description}</p>
          <div className="relative">
            <span className="absolute right-0 top-0 z-10 flex gap-3 p-3">
              <button className="h-10 w-10 rounded bg-yellow-400/10 p-2 text-yellow-400 hover:bg-yellow-400/20">
                <Pencil />
              </button>
              <CopyToClipboard
                className="rounded bg-white/10 hover:bg-white/20"
                textToCopy={dockerCompose}
              />
            </span>
            <pre className="language-yaml relative max-h-[80vh] rounded">
              <code>{dockerCompose}</code>
            </pre>
          </div>
        </>
      ) : (
        "Carregando..."
      )}
    </section>
  );
}
