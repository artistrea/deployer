import { FolderCog, Settings } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

export default function DeploysPage() {
  const { data: deploys } = api.deploy.getAll.useQuery(undefined, {
    networkMode: "always",
  });

  return (
    <>
      <Head>
        <title>Deployer - Deploys</title>
        <meta
          name="description"
          content="Faça seu deploy no servidor da Struct com alguns cliques"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="min-h-screen flex-col bg-zinc-900 p-8 text-white sm:p-16">
        <h1 className="text-3xl">Deploys que estão no ar</h1>
        <main className="px-4 py-8 sm:p-8">
          <ul className="flex flex-wrap gap-4">
            {deploys?.map((deploy) => (
              <li
                key={deploy.id}
                className="relative flex w-80 flex-col gap-4 rounded-xl bg-white/10 p-4"
              >
                <Link
                  className="absolute right-0 top-0 m-2 rounded-xl p-2 text-yellow-400/80 underline shadow shadow-black/20 hover:shadow-black/80"
                  href={{
                    pathname: "deploys/[id]",
                    query: {
                      id: deploy.id,
                    },
                  }}
                  title="Ver Configuração"
                >
                  <FolderCog size={24} />
                </Link>
                <div>{deploy.name}</div>
                <ul className="mt-auto flex flex-wrap gap-2">
                  {deploy.domains.map((domain) => (
                    <li key={domain.value} className="flex text-xs">
                      <Link
                        className="flex max-w-xs flex-col gap-4 rounded-xl p-2 shadow shadow-black/20 hover:shadow-black/80"
                        href={`https://${domain.value}`}
                        target="_blank"
                      >
                        {domain.value}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </main>
      </section>
    </>
  );
}
