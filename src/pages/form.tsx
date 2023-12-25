import {
  useForm,
  SubmitHandler,
  useFieldArray,
  FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus, Rocket } from "lucide-react";
import { useMemo } from "react";

const exposedConfigSchema = z.union([
  z.object({
    rule: z.string().min("Host(``)".length).max(256),
    port: z.number().optional(),
    hasCertificate: z.literal(false),
  }),
  z.object({
    rule: z.string().min("Host(``)".length).max(256),
    port: z.number().optional(),
    hasCertificate: z.literal(true),
    certificate: z.object({
      name: z.string().min(1).max(32),
      forDomain: z.string().min(1).max(64),
      forSubDomains: z.array(
        z.object({
          value: z.string().min(1).max(64),
        }),
      ),
    }),
  }),
]);

const serviceSchema = z.union([
  z.object({
    name: z.string().min(1).max(32),
    dockerImage: z.string().min(1).max(64),
    hasInternalNetwork: z.literal(false),
    hasExposedConfig: z.literal(false),
    environmentVariables: z.array(
      z.object({
        key: z.string().min(1).max(64),
        value: z.string().min(1).max(256),
      }),
    ),
  }),
  z.object({
    name: z.string().min(1).max(32),
    dockerImage: z.string().min(1).max(64),
    hasInternalNetwork: z.literal(true),
    dependsOn: z.string().max(32).optional(),
    hasExposedConfig: z.literal(false),
    environmentVariables: z.array(
      z.object({
        key: z.string().min(1).max(64),
        value: z.string().min(1).max(256),
      }),
    ),
  }),
  z.object({
    name: z.string().min(1).max(32),
    dockerImage: z.string().min(1).max(64),
    hasInternalNetwork: z.literal(false),
    hasExposedConfig: z.literal(true),
    exposedConfig: exposedConfigSchema,
    environmentVariables: z.array(
      z.object({
        key: z.string().min(1).max(64),
        value: z.string().min(1).max(256),
      }),
    ),
  }),
  z.object({
    name: z.string().min(1).max(32),
    dockerImage: z.string().min(1).max(64),
    hasInternalNetwork: z.literal(true),
    dependsOn: z.string().max(32).optional(),
    hasExposedConfig: z.literal(true),
    exposedConfig: exposedConfigSchema,
    environmentVariables: z.array(
      z.object({
        key: z.string().min(1).max(64),
        value: z.string().min(1).max(256),
      }),
    ),
  }),
]);

const schema = z.object({
  deploy: z.object({
    name: z.string().min(1).max(64),
    description: z.string().min(1).max(65535),
  }),
  deployDomains: z.array(z.object({ value: z.string().min(1).max(64) })),
  services: z.array(serviceSchema).min(1),
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
  type ServiceProps = {
    index: number;
    removeServices: typeof removeServices;
    register: typeof register;
    watch: typeof watch;
    errors: typeof errors;
    field: (typeof fieldsServices)[number];
  };

  console.log(errors);

  // component Service made inside so that types may be inferred from current component
  // useMemo so that rerenders don't remove focus from current input
  // rerender may happen while changing input because of `watch` and `errors`
  const Service = useMemo(
    () =>
      ({
        index,
        register,
        removeServices,
        watch,
        errors,
        field,
      }: ServiceProps) => {
        const {
          fields: fieldsEnvironment,
          append: appendEnvironment,
          remove: removeEnvironment,
        } = useFieldArray({
          control, // control props comes from useForm (optional: if you are using FormContext)
          name: `services.${index}.environmentVariables`, // unique name for your Field Array
        });

        const {
          fields: fieldsCertificateSubDomains,
          append: appendCertificateSubDomains,
          remove: removeCertificateSubDomains,
        } = useFieldArray({
          control, // control props comes from useForm (optional: if you are using FormContext)
          name: `services.${index}.exposedConfig.certificate.forSubDomains`, // unique name for your Field Array
        });

        return (
          <div className="flex w-full gap-1">
            <button
              className="rounded bg-red-400/10 p-1 text-red-400 focus-within:bg-red-400/20 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current hover:bg-red-400/20"
              type="button"
              onClick={() => removeServices(index)}
            >
              <Minus size={20} />
            </button>
            <div className="flex w-full flex-col gap-1">
              <input
                className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
                placeholder="Nome do serviço"
                {...register(`services.${index}.name`)}
              />

              <ErrorMessage message={errors.services?.[index]?.name?.message} />

              <input
                className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
                list="common-service-names"
                placeholder="Imagem docker do serviço"
                {...register(`services.${index}.dockerImage`)}
              />

              <ErrorMessage
                message={errors.services?.[index]?.dockerImage?.message}
              />

              <span className="pl-4">
                <label
                  className="mr-2"
                  htmlFor={`services.${index}.hasInternalNetwork`}
                >
                  Se conecta a outro serviço interno?
                </label>
                <input
                  id={`services.${index}.hasInternalNetwork`}
                  type="checkbox"
                  className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
                  placeholder="Nome do serviço"
                  {...register(`services.${index}.hasInternalNetwork`)}
                />
                {watch(`services.${index}.hasInternalNetwork`) && (
                  <>
                    <input
                      className="w-full rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current disabled:opacity-60"
                      placeholder="Ele que depende do outro? De qual?"
                      {...register(`services.${index}.dependsOn`)}
                    />

                    <ErrorMessage
                      message={
                        (
                          errors.services?.[index] as
                            | undefined
                            | FieldErrors<
                                typeof field & { hasInternalNetwork: true }
                              >
                        )?.dependsOn?.message
                      }
                    />
                  </>
                )}
              </span>
              <span className="pl-4">
                <label htmlFor={`services.${index}.hasExposedConfig`}>
                  Expor serviço para a internet?
                </label>
                <input
                  id={`services.${index}.hasExposedConfig`}
                  type="checkbox"
                  className="mx-2 inline rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
                  placeholder="Nome do serviço"
                  {...register(`services.${index}.hasExposedConfig`)}
                />
                {watch(`services.${index}.hasExposedConfig`) && (
                  <div className="flex flex-col gap-1">
                    <input
                      className="w-full rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current disabled:opacity-60"
                      placeholder="Regra. e.g. Host(`www.structej.com`) *"
                      {...register(`services.${index}.exposedConfig.rule`)}
                    />

                    <ErrorMessage
                      message={
                        (
                          errors.services?.[index] as
                            | undefined
                            | FieldErrors<
                                typeof field & { hasExposedConfig: true }
                              >
                        )?.exposedConfig?.rule?.message
                      }
                    />

                    <input
                      className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current disabled:opacity-60"
                      placeholder="Especificar port"
                      type="number"
                      {...register(`services.${index}.exposedConfig.port`, {
                        setValueAs(value) {
                          if (value === "") return undefined;
                          return parseInt(value, 10);
                        },
                      })}
                    />

                    <ErrorMessage
                      message={
                        (
                          errors.services?.[index] as
                            | undefined
                            | FieldErrors<
                                typeof field & { hasExposedConfig: true }
                              >
                        )?.exposedConfig?.port?.message
                      }
                    />

                    <span className="pl-4">
                      <label
                        className="mr-2"
                        htmlFor={`services.${index}.exposedConfig.hasCertificate`}
                      >
                        Criar certificado?
                      </label>
                      <input
                        id={`services.${index}.exposedConfig.hasCertificate`}
                        type="checkbox"
                        className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
                        placeholder="Nome do serviço"
                        {...register(
                          `services.${index}.exposedConfig.hasCertificate`,
                        )}
                      />
                      {watch(`services.${index}.hasExposedConfig`) &&
                        watch(
                          `services.${index}.exposedConfig.hasCertificate`,
                        ) && (
                          <div className="flex flex-col gap-1">
                            <input
                              className="w-full rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current disabled:opacity-60"
                              placeholder="Nome do Certificado *"
                              {...register(
                                `services.${index}.exposedConfig.certificate.name`,
                              )}
                            />

                            <ErrorMessage
                              message={
                                (
                                  errors.services?.[index] as
                                    | undefined
                                    | FieldErrors<
                                        typeof field & {
                                          hasExposedConfig: true;
                                          exposedConfig: {
                                            hasCertificate: true;
                                          };
                                        }
                                      >
                                )?.exposedConfig?.certificate?.name?.message
                              }
                            />

                            <input
                              className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current disabled:opacity-60"
                              placeholder="Domínio que precisa de https *"
                              {...register(
                                `services.${index}.exposedConfig.certificate.forDomain`,
                              )}
                            />

                            <ErrorMessage
                              message={
                                (
                                  errors.services?.[index] as
                                    | undefined
                                    | FieldErrors<
                                        typeof field & {
                                          hasExposedConfig: true;
                                          exposedConfig: {
                                            hasCertificate: true;
                                          };
                                        }
                                      >
                                )?.exposedConfig?.certificate?.forDomain
                                  ?.message
                              }
                            />

                            <span className="flex flex-col gap-1 pl-4">
                              <p>Subdomínios que também precisam:</p>
                              {fieldsCertificateSubDomains.map((f, i) => (
                                <div
                                  className="flex w-full flex-col gap-1"
                                  key={f.id}
                                >
                                  <div className="flex w-full gap-1">
                                    <button
                                      className="rounded bg-red-400/10 p-1 text-red-400 focus-within:bg-red-400/20 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current hover:bg-red-400/20"
                                      type="button"
                                      onClick={() =>
                                        removeCertificateSubDomains(index)
                                      }
                                    >
                                      <Minus size={20} />
                                    </button>
                                    <div className="flex w-full flex-col gap-1">
                                      <input
                                        className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current disabled:opacity-60"
                                        placeholder="Subdomínio que precisa de https *"
                                        {...register(
                                          `services.${index}.exposedConfig.certificate.forSubDomains.${i}.value`,
                                        )}
                                      />
                                    </div>
                                  </div>

                                  <ErrorMessage
                                    message={
                                      (
                                        errors.services?.[index] as
                                          | undefined
                                          | FieldErrors<
                                              typeof field & {
                                                hasExposedConfig: true;
                                                exposedConfig: {
                                                  hasCertificate: true;
                                                };
                                              }
                                            >
                                      )?.exposedConfig?.certificate
                                        ?.forSubDomains?.[i]?.value?.message
                                    }
                                  />
                                </div>
                              ))}
                              <button
                                className="mr-auto rounded bg-green-400/10 p-1 text-green-400 focus-within:bg-green-400/20 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current hover:bg-green-400/20"
                                type="button"
                                onClick={() =>
                                  appendCertificateSubDomains({ value: "" })
                                }
                              >
                                <Plus size={20} />
                              </button>
                            </span>
                          </div>
                        )}
                    </span>
                  </div>
                )}
              </span>
              <div className="flex flex-col gap-1 pl-4">
                <p>Variáveis de Ambiente</p>
                {fieldsEnvironment.map((f, i) => (
                  <div className="flex w-full gap-1" key={f.id}>
                    <button
                      className="rounded bg-red-400/10 p-1 text-red-400 focus-within:bg-red-400/20 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current hover:bg-red-400/20"
                      type="button"
                      onClick={() => removeEnvironment(i)}
                    >
                      <Minus size={20} />
                    </button>
                    <div className="flex flex-col gap-1">
                      <input
                        className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
                        placeholder="Key"
                        {...register(
                          `services.${index}.environmentVariables.${i}.key`,
                        )}
                      />
                      <ErrorMessage
                        message={
                          errors.services?.[index]?.environmentVariables?.[i]
                            ?.key?.message
                        }
                      />

                      <input
                        className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
                        placeholder="Value"
                        {...register(
                          `services.${index}.environmentVariables.${i}.value`,
                        )}
                      />
                      <ErrorMessage
                        message={
                          errors.services?.[index]?.environmentVariables?.[i]
                            ?.value?.message
                        }
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="mr-auto rounded bg-green-400/10 p-1 text-green-400 focus-within:bg-green-400/20 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current hover:bg-green-400/20"
                  type="button"
                  onClick={() => appendEnvironment({ key: "", value: "" })}
                >
                  <Plus size={20} />
                </button>
                <ErrorMessage message={errors.services?.root?.message} />
              </div>
            </div>
          </div>
        );
      },
    [],
  );

  return (
    <main className="flex h-full min-h-screen flex-col bg-zinc-900 p-8 text-white">
      {/* {JSON.stringify(errors, null, 2)} */}
      <h1 className="mb-8 text-4xl">Crie a Configuração do seu deploy</h1>
      <form
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-2 p-8"
        onSubmit={(e) => {
          handleSubmit(onSubmit)(e);
        }}
      >
        <div className="flex flex-col">
          <label htmlFor="deploy.name">Nome</label>
          <input
            id="deploy.name"
            className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
            {...register("deploy.name")}
          />
          <ErrorMessage message={errors.deploy?.name?.message} />
        </div>
        <div className="flex flex-col">
          <label htmlFor="deploy.description">Descrição</label>
          <input
            id="deploy.description"
            className="rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
            {...register("deploy.description")}
          />

          <ErrorMessage message={errors.deploy?.description?.message} />
        </div>
        <div className="mb-4 flex flex-col gap-2 pl-4">
          <h2 className="text-xl">Domínios</h2>
          <span className="flex flex-col gap-1">
            {fieldsDomains.map((field, index) => (
              <div className="flex w-full flex-col gap-1" key={field.id}>
                <div className="flex w-full gap-1">
                  <button
                    className="rounded bg-red-400/10 p-1 text-red-400 focus-within:bg-red-400/20 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current hover:bg-red-400/20"
                    type="button"
                    onClick={() => removeDomains(index)}
                    title={`Remover domínio ${field.value || "vazio"}`}
                  >
                    <Minus size={20} />
                  </button>
                  <input
                    className="block h-full rounded-sm bg-zinc-200/5 p-2 focus-within:bg-zinc-200/15 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current"
                    key={field.id}
                    {...register(`deployDomains.${index}.value`)}
                  />
                </div>
                <span className="pb-1 text-sm text-red-500">
                  <ErrorMessage
                    message={errors.deployDomains?.[index]?.value?.message}
                  />
                </span>
              </div>
            ))}
          </span>
          <button
            className="mr-auto rounded bg-green-400/10 p-1 text-green-400 focus-within:bg-green-400/20 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current hover:bg-green-400/20"
            type="button"
            onClick={() => appendDomains({ value: "" })}
          >
            <Plus size={20} />
          </button>
          <ErrorMessage message={errors.deployDomains?.message} />

          <h2 className="text-xl">Serviços</h2>
          {fieldsServices.map((field, index) => {
            return (
              <Service
                key={field.id}
                index={index}
                errors={errors}
                register={register}
                removeServices={removeServices}
                watch={watch}
                field={field}
              />
            );
          })}
          <button
            className="mr-auto rounded bg-green-400/10 p-1 text-green-400 focus-within:bg-green-400/20 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current hover:bg-green-400/20"
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
          <ErrorMessage message={errors.services?.message} />
        </div>

        <button className="relative ml-auto mt-auto flex items-center gap-4 rounded bg-blue-400/10 px-14 py-4 text-xl text-blue-400 hover:bg-blue-400/20">
          Criar
          <Rocket size={20} className="absolute right-9 top-1/2" />
        </button>

        <datalist id="common-service-names">
          <option value="structej/projetos:nome-do-projeto-x.y"></option>
          <option value="postgres:16.1-alpine3.19"></option>
          <option value="mysql:8"></option>
        </datalist>
      </form>
    </main>
  );
}

function ErrorMessage<T extends string | undefined>({
  message,
}: {
  message: T;
}) {
  return (
    message && <span className="py-1 text-sm text-red-500">{message}</span>
  );
}
