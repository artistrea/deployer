import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Link from "next/link";
import { cn } from "~/utils/cn";

export default function DeployPage() {
  const router = useRouter();

  const { id } = router.query;

  const { data: deploy } = api.deploy.get.useQuery(Number(id), {
    networkMode: "always",
  });

  const { data: domainsWithStatus } = api.deploy.getDomainsWithStatus.useQuery(
    deploy?.domains,
  );

  return (
    <section className="min-h-screen flex-col bg-zinc-900 p-8 text-white sm:p-16">
      {deploy ? (
        <>
          <h1 className="text-3xl">{deploy.name}</h1>
          <pre className="h-max w-full bg-transparent p-0 font-[inherit] text-sm leading-6 text-white/70">
            {deploy.description}
          </pre>
          <ul className="mt-2 flex flex-wrap gap-2">
            {!domainsWithStatus &&
              deploy.domains.map((domain) => (
                <li key={domain.value} className="flex text-xs">
                  <DomainLinkWithStatus domainName={domain.value} status={-1} />
                </li>
              ))}

            {domainsWithStatus?.map((domain) => (
              <li key={domain.value} className="flex text-xs">
                <DomainLinkWithStatus
                  domainName={domain.value}
                  status={domain.status}
                />
              </li>
            ))}
          </ul>
          <h2 className="mt-8 text-xl">Ações</h2>
          <ul>
            <li>
              <button className="m-2 rounded bg-green-400/10 px-3 py-2 text-green-400 hover:bg-green-400/20">
                Ligar <p className="text-xs">(docker compose up -d)</p>
              </button>
            </li>
            <li>
              <button className="m-2 rounded bg-red-400/10 px-3 py-2 text-red-400 hover:bg-red-400/20">
                Desligar <p className="text-xs">(docker compose down)</p>
              </button>
            </li>
            <li>
              <button className="m-2 rounded bg-orange-400/10 px-3 py-2 text-orange-400 hover:bg-orange-400/20">
                Nova versão
                <p className="text-xs">(docker compose up --build -d)</p>
              </button>
            </li>
          </ul>
          <h2 className="mt-8 text-xl">
            Referência do que adicionar ao servidor:
          </h2>
          <button
            type="submit"
            className="m-2 rounded bg-blue-400/10 px-3 py-2 text-blue-400 hover:bg-blue-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            Ver arquivos a alterar no servidor
          </button>
        </>
      ) : (
        "Carregando..."
      )}
    </section>
  );
}

function DomainLinkWithStatus({
  domainName,
  status,
}: {
  domainName: string;
  status: number;
}) {
  return (
    <Link
      className="flex max-w-xs gap-4 rounded-xl p-2 shadow shadow-black/20 hover:shadow-black/80"
      href={`https://${domainName}`}
      target="_blank"
    >
      <span
        className={cn("contents", {
          "text-green-400": status >= 200 && status < 300,
          "text-blue-400": status >= 300 && status < 400,
          "text-yellow-400": status >= 400 && status < 500,
          "text-purple-400": status >= 500,
        })}
      >
        {status !== -1 && status}
        <div className="my-auto h-2 w-2 rounded-full bg-current" />
      </span>
      {domainName}
    </Link>
  );
}
