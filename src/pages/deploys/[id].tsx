import { useRouter } from "next/router";
import { RouterOutputs, api } from "~/utils/api";
import Prism from "prismjs";
import "prismjs/components/prism-yaml";
import { useEffect } from "react";
import { Pencil } from "lucide-react";
import { CopyToClipboard } from "~/components/CopyToClipboard";

type Deploy = NonNullable<RouterOutputs["deploy"]["get"]>;

function serviceTemplate(
  {
    dockerImage,
    name,
    exposedConfig,
    environmentVariables,
    dependsOn,
    hasInternalNetwork,
    volumes,
  }: Deploy["services"][number],
  deploy: Deploy,
) {
  return `
  ${name}:
    image: ${dockerImage}
    restart: always
    networks:${
      !hasInternalNetwork
        ? ""
        : `
      - internal`
    }${
      !exposedConfig
        ? ""
        : `
      - proxy`
    }${
      !dependsOn
        ? ""
        : `
    depends_on:${dependsOn.reduce(
      (p, d) => `${p}
      - ${deploy.services.find((s) => s.id === d.dependsOnId)?.name}`,
      "",
    )}`
    }${
      !volumes
        ? ""
        : `
    volumes:${volumes.reduce(
      (pr, volume) => `${pr}
      - ${volume.value}`,
      "",
    )}`
    }${
      !environmentVariables
        ? ""
        : `
    environment:${environmentVariables.reduce(
      (prev, k) => `${prev}
      ${k.key}: ${k.value}`,
      "",
    )}`
    }${
      !exposedConfig
        ? ""
        : `
    labels:
      - traefik.enable=true
      - traefik.docker.network=proxy

      # # http access
      - traefik.http.routers.${name}-router.rule=${exposedConfig.rule}
      - traefik.http.routers.${name}-router.entrypoints=web

      # # https access

      - traefik.http.routers.${name}-router-websecure.rule=${exposedConfig.rule}
      - traefik.http.routers.${name}-router-websecure.entrypoints=websecure
      - traefik.http.routers.${name}-router-websecure.tls=true

      # # redirect http to https

      - traefik.http.middlewares.${name}-router-redirect-to-websecure.redirectscheme.scheme=https
      - traefik.http.routers.${name}-router.middlewares=${name}-router-redirect-to-websecure
${
  !exposedConfig.certificate
    ? ""
    : `
      # # certResolver pra quando precisar gerar certificado por aqui:
      # # Ver traefik.yml para ver a configuracao do challenge:
      
      - traefik.http.routers.${name}-router-websecure.tls.certResolver=${
        exposedConfig.certificate.name
      }
      
      # # Domains that need certificate:
      - traefik.http.routers.${name}-router-websecure.tls.domains[0].main=${
        exposedConfig.certificate.forDomain
      }
      - traefik.http.routers.${name}-router-websecure.tls.domains[0].sans=${exposedConfig.certificate.forSubDomains
        .map((sbd) => sbd.value)
        .join(",")}`
}`
    }
`;
}

function generateDockerComposeTemplate(deploy: RouterOutputs["deploy"]["get"]) {
  if (!deploy) return "";

  let allVolumes = deploy.services
    .reduce(
      (prev, s) =>
        s.volumes ? [...prev, ...s.volumes.map((v) => v.value)] : prev,
      [] as string[],
    )
    .map((v) => v.substring(0, v.indexOf(":")));

  allVolumes = allVolumes.filter((v, i) => allVolumes.indexOf(v) === i);

  return `version: "3.3"

networks:
  internal:
    external: false
  # traefik network:
  proxy:
    external: true

services:${deploy.services.map((s) => serviceTemplate(s, deploy)).join("")}
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
    const highlight = async () => {
      await Prism.highlightAll(); // <--- prepare Prism
    };
    highlight(); // <--- call the async function
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
