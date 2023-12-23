import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Prism from "prismjs";
import "prismjs/components/prism-yaml";
import { useEffect } from "react";
import { Copy, Pencil } from "lucide-react";
import { CopyToClipboard } from "~/components/CopyToClipboard";

const docompose = `version: "3.3"

networks:
  proxy:
    external: true
  internal:
    external: false

services:
  site-struct-front:
    image: structej/projetos:site-struct-front-1.5
    labels:
      - traefik.enable=true
      - traefik.docker.network=proxy

      # # http access
      - traefik.http.routers.site-struct-front-router.rule=Host(\`structej.com\`, \`www.structej.com\`, \`struct.unb.br\`, \`www.struct.unb.br\`) && !PathPrefix(\`/api\`) && !PathPrefix(\`/rails\`)
      - traefik.http.routers.site-struct-front-router.entrypoints=web

      # # https access

      - traefik.http.routers.site-struct-front-router-websecure.rule=Host(\`structej.com\`, \`www.structej.com\`, \`struct.unb.br\`, \`www.struct.unb.br\`) && !PathPrefix(\`/api\`) && !PathPrefix(\`/rails\`)
      - traefik.http.routers.site-struct-front-router-websecure.entrypoints=websecure
      - traefik.http.routers.site-struct-front-router-websecure.tls=true

      # # redirect http to https

      - traefik.http.middlewares.site-struct-front-router-redirect-to-websecure.redirectscheme.scheme=https
      - traefik.http.routers.site-struct-front-router.middlewares=site-struct-front-router-redirect-to-websecure

      # # certResolver pra quando precisar gerar certificado por aqui:
      # # Ver traefik.yml para ver a configuracao do challenge:

      - traefik.http.routers.site-struct-front-router-websecure.tls.certResolver=struct-certresolver

      # # Domains that need certificate:
      - traefik.http.routers.site-struct-front-router-websecure.tls.domains[0].main=struct.unb.br
      - traefik.http.routers.site-struct-front-router-websecure.tls.domains[0].sans=www.struct.unb.br

    restart: always
    networks:
      - proxy

  site-struct-api:
    image: structej/projetos:site-struct-api-1.2
    environment:
      - STRUCT_DATABASE=db_name
      - STRUCT_DATABASE_USERNAME=db_user
      - STRUCT_DATABASE_PASSWORD=db_pwd
      - MAILJET_API_KEY=trasagdadvadgadgd
      - MAILJET_SECRET_KEY=trasagdadvadgadgd
      - SECRET_KEY_BASE=trasagdadvadgadgdtrasagdadvadgadgdtrasagdadvadgadgdtrasagdadvadgadgdtrasagdadvadgadgdtrasagdadvadgadgdtrasagdadvadgadgdtrasagdadvadgadgd
      - CONTACT_EMAIL=ava@test.com

    labels:
      - traefik.enable=true
      - traefik.docker.network=proxy

      # # http access
      - traefik.http.routers.site-struct-api-router.rule=Host(\`structej.com\`) && ( PathPrefix(\`/rails\`) || PathPrefix(\`/api\`) )
      - traefik.http.routers.site-struct-api-router.entrypoints=web

      # # https access

      - traefik.http.routers.site-struct-api-router-websecure.rule=Host(\`structej.com\`) && ( PathPrefix(\`/rails\`) || PathPrefix(\`/api\`) )
      - traefik.http.routers.site-struct-api-router-websecure.entrypoints=websecure
      - traefik.http.routers.site-struct-api-router-websecure.tls=true

      # # Specify to container port
      - traefik.http.routers.site-struct-api-router-websecure.service=site-struct-api-router-service
      - traefik.http.routers.site-struct-api-router.service=site-struct-api-router-service
      - traefik.http.services.site-struct-api-router-service.loadbalancer.server.port=3000

      # # redirect http to https

      - traefik.http.middlewares.site-struct-api-router-redirect-to-websecure.redirectscheme.scheme=https
      - traefik.http.routers.site-struct-api-router.middlewares=site-struct-api-router-redirect-to-websecure

      # # certResolver pra quando precisar gerar certificado por aqui:
      # # Ver traefik.yml para ver a configuracao do challenge:

    restart: always
    volumes:
      - project_data:/app/storage/
    networks:
      - proxy
      - internal
    depends_on:
      - db
    links:
      - db

  db:
    image: postgres:10.4-alpine
    restart: always
    environment:
      POSTGRES_DB: db_name
      POSTGRES_USER: db_user
      POSTGRES_PASSWORD: db_pwd
      PGDATA: /var/lib/postgresql/data/
    networks:
      - internal
    volumes:
      - pg_data:/var/lib/postgresql/data/

volumes:
  pg_data:
  project_data:

`;

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
  }, [deploy, docompose]);

  return (
    <section className="min-h-screen flex-col bg-zinc-900 p-8 text-white sm:p-16">
      {deploy ? (
        <>
          <h1 className="text-3xl">{deploy.name}</h1>
          <p className="text-sm text-white/70">{deploy.description}</p>
          <details>
            <summary>Config</summary>
            <form className="p-8">
              <ul>
                {deploy.services.map((service) => (
                  <li>
                    <h2 className="text-xl">{service.name}</h2>
                    <div>{service.template}</div>
                  </li>
                ))}
              </ul>
            </form>
          </details>
          <pre className="language-yaml relative max-h-[80vh] rounded">
            <span className="absolute right-0 top-0 m-2 flex gap-2">
              <CopyToClipboard
                className="fixed -translate-x-full rounded bg-white/10 hover:bg-white/20"
                textToCopy={docompose}
              />
              <button className="fixed -ml-2 h-10 w-10 -translate-x-[200%] rounded bg-white/10 p-2 text-yellow-400 hover:bg-white/20">
                <Pencil />
              </button>
            </span>
            <code>{docompose}</code>
          </pre>
        </>
      ) : (
        "Carregando..."
      )}
    </section>
  );
}
