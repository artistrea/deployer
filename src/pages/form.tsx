import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus } from "lucide-react";

const schema = z.object({
  deploy: z.object({
    name: z.string().min(1).max(64),
    description: z.string().min(1).max(65535),
  }),
  deployDomains: z.array(z.object({ value: z.string().min(1).max(64) })),
  services: z.array(
    z.object({
      name: z.string().min(1).max(32),
      dockerImage: z.string().min(1).max(64),
      hasInternalNetwork: z.boolean(),
      dependsOn: z.string().max(32).optional(),
      hasExposedConfig: z.boolean(),
      exposedConfig: z
        .object({
          rule: z.string().min("Host(``)".length).max(256),
          port: z.number().optional(),
          certificate: z
            .object({
              name: z.string().min(1).max(32),
              forDomain: z.string().min(1).max(64),
              forSubDomains: z.array(
                z.object({
                  value: z.string().min(1).max(64),
                }),
              ),
            })
            .optional(),
          hasCertificate: z.boolean().optional(),
        })
        .optional(),
      environmentVariables: z.array(
        z.object({
          key: z.string().min(1).max(64),
          value: z.string().min(1).max(256),
        }),
      ),
    }),
  ),
});

type DeploySchema = z.infer<typeof schema>;

export default function FormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<DeploySchema>({ resolver: zodResolver(schema) });
  const onSubmit: SubmitHandler<DeploySchema> = (data) =>
    alert(JSON.stringify(data, null, 2));

  const {
    fields: fieldsDomains,
    append: appendDomains,
    remove: removeDomains,
  } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "deployDomains", // unique name for your Field Array
  });

  const {
    fields: fieldsServices,
    append: appendServices,
    remove: removeServices,
  } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: "services", // unique name for your Field Array
  });

  function Service({ index }: { index: number }) {
    const {
      fields: fieldsEnvironment,
      append: appendEnvironment,
      remove: removeEnvironment,
    } = useFieldArray({
      control, // control props comes from useForm (optional: if you are using FormContext)
      name: `services.${index}.environmentVariables`, // unique name for your Field Array
    });

    return (
      <div className="flex w-full gap-1">
        <button
          className="rounded bg-red-400/10 p-1 text-red-400"
          type="button"
          onClick={() => removeServices(index)}
        >
          <Minus size={20} />
        </button>
        <div className="flex w-full flex-col gap-1">
          <input
            className="bg-zinc-800 p-2"
            placeholder="Nome do serviço"
            {...register(`services.${index}.name`)}
          />
          <input
            className="bg-zinc-800 p-2"
            list="common-service-names"
            placeholder="Imagem docker do serviço"
            {...register(`services.${index}.dockerImage`)}
          />
          <span className="pl-4">
            <label htmlFor={`services.${index}.hasInternalNetwork`}>
              Se conecta a outro serviço interno?
            </label>
            <input
              id={`services.${index}.hasInternalNetwork`}
              type="checkbox"
              className="mx-2 inline bg-zinc-800 p-2"
              placeholder="Nome do serviço"
              {...register(`services.${index}.hasInternalNetwork`)}
            />
            {watch(`services.${index}.hasInternalNetwork`) && (
              <input
                className="w-full bg-zinc-800 p-2 disabled:opacity-60"
                placeholder="Ele que depende do outro? De qual?"
                {...register(`services.${index}.dependsOn`)}
              />
            )}
          </span>
          <span className="pl-4">
            <label htmlFor={`services.${index}.hasExposedConfig`}>
              Expor serviço para a internet?
            </label>
            <input
              id={`services.${index}.hasExposedConfig`}
              type="checkbox"
              className="mx-2 inline bg-zinc-800 p-2"
              placeholder="Nome do serviço"
              {...register(`services.${index}.hasExposedConfig`)}
            />
            {/* 
            port: z.number().optional(),
            certificate: z
              .object({
                name: z.string().min(1).max(32),
                forDomain: z.string().min(1).max(64),
                forSubDomains: z.array(
                  z.object({
                    value: z.string().min(1).max(64),
                  }),
                ),
            hasCertificate: z.boolean(),
            }) */}
            {watch(`services.${index}.hasExposedConfig`) && (
              <div className="flex flex-col gap-1">
                <input
                  className="w-full bg-zinc-800 p-2 disabled:opacity-60"
                  placeholder="Regra. e.g. Host(`www.structej.com`) *"
                  {...register(`services.${index}.exposedConfig.rule`)}
                />
                <input
                  className="bg-zinc-800 p-2 disabled:opacity-60"
                  placeholder="Especificar port"
                  type="number"
                  {...register(`services.${index}.exposedConfig.port`, {
                    setValueAs(value) {
                      if (value === "") return undefined;
                      return parseInt(value, 10);
                    },
                  })}
                />
                {errors.services?.[index]?.exposedConfig?.port?.message}
              </div>
            )}
          </span>
          <div className="flex flex-col gap-1 pl-4">
            <p>Variáveis de Ambiente</p>
            {fieldsEnvironment.map((f, i) => (
              <div className="flex w-full gap-1" key={f.id}>
                <button
                  className="rounded bg-red-400/10 p-1 text-red-400"
                  type="button"
                  onClick={() => removeEnvironment(i)}
                >
                  <Minus size={20} />
                </button>

                <input
                  className="bg-zinc-800 p-2"
                  placeholder="Key"
                  {...register(
                    `services.${index}.environmentVariables.${i}.key`,
                  )}
                />
                <input
                  className="bg-zinc-800 p-2"
                  placeholder="Value"
                  {...register(
                    `services.${index}.environmentVariables.${i}.value`,
                  )}
                />
              </div>
            ))}
            <button
              className="mr-auto rounded bg-green-400/10 p-1 text-green-400"
              type="button"
              onClick={() => appendEnvironment({ key: "", value: "" })}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-zinc-900 p-8 text-white">
      {/* {JSON.stringify(errors, null, 2)} */}
      <h1 className="mb-8 text-4xl">Crie a Configuração do seu deploy</h1>
      <form
        className="mx-auto flex w-96 flex-col gap-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col">
          <label htmlFor="deploy.name">Nome</label>
          <input
            id="deploy.name"
            className="bg-zinc-800 p-2"
            {...register("deploy.name")}
          />
          <span className="py-1 text-sm text-red-500">
            {errors.deploy?.name?.message}
          </span>
        </div>
        <div className="flex flex-col">
          <label htmlFor="deploy.description">Descrição</label>
          <input
            id="deploy.description"
            className="bg-zinc-800 p-2"
            {...register("deploy.description")}
          />
          <span className="py-1 text-sm text-red-500">
            {errors.deploy?.description?.message}
          </span>
        </div>
        <h2 className="text-xl">Domínios</h2>
        {fieldsDomains.map((field, index) => (
          <div className="flex w-full gap-1">
            <button
              className="rounded bg-red-400/10 p-1 text-red-400"
              type="button"
              onClick={() => removeDomains(index)}
              title={`Remover domínio ${field.value || "vazio"}`}
            >
              <Minus size={20} />
            </button>
            <div className="flex w-full flex-col gap-1">
              <input
                className="bg-zinc-800 p-2"
                key={field.id}
                {...register(`deployDomains.${index}.value`)}
              />

              <span className="py-1 text-sm text-red-500">
                {errors.deployDomains?.[index]?.value?.message}
              </span>
            </div>
          </div>
        ))}
        <button
          className="mr-auto rounded bg-green-400/10 p-1 text-green-400"
          type="button"
          onClick={() => appendDomains({ value: "" })}
        >
          <Plus size={20} />
        </button>
        <h2 className="text-xl">Serviços</h2>
        {fieldsServices.map((field, index) => {
          return <Service key={field.id} index={index} />;
        })}
        <button
          className="mr-auto rounded bg-green-400/10 p-1 text-green-400"
          type="button"
          onClick={() =>
            appendServices({
              name: "",
              dockerImage: "",
              hasInternalNetwork: false,
              environmentVariables: [],
              hasExposedConfig: false,
            })
          }
        >
          <Plus size={20} />
        </button>
        <button className="p-4">Enviar</button>

        <datalist id="common-service-names">
          <option value="structej/projetos:nome-do-projeto-x.y"></option>
          <option value="postgres:16.1-alpine3.19"></option>
          <option value="mysql:8"></option>
        </datalist>
      </form>
    </main>
  );
}
