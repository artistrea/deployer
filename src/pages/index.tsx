import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Deployer</title>
        <meta
          name="description"
          content="Faça seu deploy no servidor da Struct com alguns cliques"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-24 px-4 py-16 ">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              <span className="text-[hsl(170,80%,70%)]">Deployer</span>
            </h1>
            <p className="mt-6 bg-zinc-800/10 text-lg text-white/90">
              Visualize, crie e atualize os deploys da {"{Struct}"}
            </p>
          </div>
          {sessionData && (
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
              href="/deploys"
            >
              <h3 className="text-2xl font-semibold">Vá para o app →</h3>
            </Link>
          )}
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white/80">
                {sessionData && (
                  <span>
                    Logado como
                    <span className="text-white">
                      {" " + sessionData.user?.name}
                    </span>
                  </span>
                )}
              </p>
              <button
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={
                  sessionData ? () => void signOut() : () => void signIn()
                }
              >
                {sessionData ? "Sair" : "Entrar"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
