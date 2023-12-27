import {
  useForm,
  SubmitHandler,
  useFieldArray,
  FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus, Rocket } from "lucide-react";
import React, {
  DetailedHTMLProps,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  useMemo,
} from "react";
import { cn } from "~/utils/cn";
import {
  CreateDeploySchema,
  createDeploySchema,
} from "~/validations/createDeploy";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { ErrorMessage } from "~/components/forms/ErrorMessage";
import { Input } from "~/components/forms/Input";
import { Label } from "~/components/forms/Label";
import { TextArea } from "~/components/forms/TextArea";

export default function FormPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
  } = useForm<CreateDeploySchema>({
    resolver: zodResolver(createDeploySchema),
  });

  const router = useRouter();

  const { mutateAsync: createDeploy } = api.deploy.create.useMutation();

  const onSubmit: SubmitHandler<CreateDeploySchema> = async (data) => {
    await createDeploy(data)
      .then((deployId) => router.push(`/deploys/${deployId}`))
      .catch((err) => alert(err.message));
  };

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
              className="rounded bg-red-400/10 p-1 text-red-400 hover:bg-red-400/20 focus-visible:bg-red-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              type="button"
              onClick={() => removeServices(index)}
            >
              <Minus size={20} />
            </button>
            <div className="flex w-full flex-col">
              <Label htmlFor={`services.${index}.name`}>
                Nome do Serviço *
              </Label>
              <Input
                id={`services.${index}.name`}
                placeholder="example-service-api"
                {...register(`services.${index}.name`)}
                autoComplete="off"
              />

              <ErrorMessage message={errors.services?.[index]?.name?.message} />

              <Label htmlFor={`services.${index}.dockerImage`}>
                Nome da Imagem Docker *
              </Label>
              <Input
                list="common-service-names"
                id={`services.${index}.dockerImage`}
                placeholder="image:v"
                {...register(`services.${index}.dockerImage`)}
                autoComplete="off"
              />
              <ErrorMessage
                message={errors.services?.[index]?.dockerImage?.message}
              />

              <p className="mb-1 mt-2">Variáveis de Ambiente</p>
              <div className="flex flex-col gap-1 pl-8">
                {fieldsEnvironment.map((f, i) => (
                  <div className="flex w-full gap-1" key={f.id}>
                    <button
                      className="rounded bg-red-400/10 p-1 text-red-400 hover:bg-red-400/20 focus-visible:bg-red-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                      type="button"
                      onClick={() => removeEnvironment(i)}
                    >
                      <Minus size={20} />
                    </button>
                    <div className="flex w-full flex-col gap-1">
                      <span className="flex w-full items-center gap-2">
                        <Input
                          className="w-1/2"
                          placeholder="Key *"
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
                      </span>
                      <span className="flex w-full items-center gap-2">
                        <Input
                          className="w-1/2"
                          placeholder="Value *"
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
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  className="mr-auto rounded bg-green-400/10 p-1 text-green-400 hover:bg-green-400/20 focus-visible:bg-green-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                  type="button"
                  onClick={() => appendEnvironment({ key: "", value: "" })}
                >
                  <Plus size={20} />
                </button>

                <ErrorMessage
                  message={
                    errors.services?.[index]?.environmentVariables?.root
                      ?.message
                  }
                />
              </div>

              <Label
                className="my-2"
                htmlFor={`services.${index}.hasInternalNetwork`}
              >
                <Input
                  id={`services.${index}.hasInternalNetwork`}
                  type="checkbox"
                  className="mr-2"
                  placeholder="Nome do serviço"
                  {...register(`services.${index}.hasInternalNetwork`)}
                />
                <p className="inline text-base">
                  Se conecta a outro serviço interno?
                </p>
              </Label>
              <fieldset
                className="flex flex-col pl-8 disabled:opacity-30"
                disabled={!watch(`services.${index}.hasInternalNetwork`)}
              >
                <Label htmlFor={`services.${index}.dependsOn`}>
                  Depende de quem?
                </Label>
                <Input
                  id={`services.${index}.dependsOn`}
                  className="w-full"
                  placeholder="db"
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
              </fieldset>

              <Label
                className="my-2"
                htmlFor={`services.${index}.hasExposedConfig`}
              >
                <Input
                  id={`services.${index}.hasExposedConfig`}
                  type="checkbox"
                  className="mr-2"
                  placeholder="Nome do serviço"
                  {...register(`services.${index}.hasExposedConfig`)}
                />
                <p className="inline text-base">
                  Expor serviço para a internet?
                </p>
              </Label>
              <fieldset
                className="pl-8 disabled:opacity-30"
                disabled={!watch(`services.${index}.hasExposedConfig`)}
              >
                <div className="flex flex-col gap-1">
                  <Label htmlFor={`services.${index}.exposedConfig.rule`}>
                    Regra de redirecionamento *
                  </Label>
                  <Input
                    id={`services.${index}.exposedConfig.rule`}
                    className="w-full"
                    placeholder="Host(`example.com`, `www.example.com`)"
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

                  <Label htmlFor={`services.${index}.exposedConfig.port`}>
                    Especificar porta
                  </Label>
                  <Input
                    id={`services.${index}.exposedConfig.port`}
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

                  <Label
                    className="my-2"
                    htmlFor={`services.${index}.exposedConfig.hasCertificate`}
                  >
                    <Input
                      id={`services.${index}.exposedConfig.hasCertificate`}
                      className="mr-2"
                      type="checkbox"
                      placeholder="Nome do serviço"
                      {...register(
                        `services.${index}.exposedConfig.hasCertificate`,
                      )}
                    />
                    <p className="inline text-base">Criar certificado?</p>
                  </Label>
                  <fieldset
                    disabled={
                      !watch(`services.${index}.exposedConfig.hasCertificate`)
                    }
                    className="pl-8 disabled:opacity-30"
                  >
                    <div className="flex flex-col gap-1">
                      <Label
                        htmlFor={`services.${index}.exposedConfig.certificate.name`}
                      >
                        Nome do Certificado *
                      </Label>
                      <Input
                        className="w-full"
                        id={`services.${index}.exposedConfig.certificate.name`}
                        placeholder="nome-cert"
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

                      <Label
                        htmlFor={`services.${index}.exposedConfig.certificate.forDomain`}
                      >
                        Domínio que precisa de https *
                      </Label>
                      <Input
                        placeholder="example.com"
                        id={`services.${index}.exposedConfig.certificate.forDomain`}
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
                          )?.exposedConfig?.certificate?.forDomain?.message
                        }
                      />

                      <p className="mt-1 text-sm">
                        Subdomínios que também precisam:
                      </p>
                      <span className="flex flex-col gap-1 pl-8">
                        {fieldsCertificateSubDomains.map((f, i) => (
                          <div
                            className="flex w-full flex-col gap-1"
                            key={f.id}
                          >
                            <div className="flex w-full gap-1">
                              <button
                                className="rounded bg-red-400/10 p-1 text-red-400 hover:bg-red-400/20 focus-visible:bg-red-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                                type="button"
                                onClick={() =>
                                  removeCertificateSubDomains(index)
                                }
                              >
                                <Minus size={20} />
                              </button>
                              <Input
                                className="w-1/2"
                                placeholder="www.example.com *"
                                {...register(
                                  `services.${index}.exposedConfig.certificate.forSubDomains.${i}.value`,
                                )}
                              />
                              <ErrorMessage
                                className="my-auto ml-1"
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
                          </div>
                        ))}
                        <button
                          className="mr-auto rounded bg-green-400/10 p-1 text-green-400 hover:bg-green-400/20 focus-visible:bg-green-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                          type="button"
                          onClick={() =>
                            appendCertificateSubDomains({ value: "" })
                          }
                        >
                          <Plus size={20} />
                        </button>
                      </span>
                    </div>
                  </fieldset>
                </div>
              </fieldset>
            </div>
          </div>
        );
      },
    [],
  );

  return (
    <main className="flex h-full min-h-screen flex-col bg-zinc-900 p-8 text-white">
      {/* {JSON.stringify(errors, null, 2)} */}
      <form
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-2 p-8"
        onSubmit={(e) => {
          handleSubmit(onSubmit)(e);
        }}
      >
        <div className="-ml-2 mb-6">
          <h1 className="-ml-2 text-3xl">Novo Deploy</h1>
          <p className="mt-1 max-w-prose text-lg leading-6 text-zinc-300">
            Adicione metadados na primeira parte, e, na segunda, as informações
            que serão utilizadas para gerar o deploy.
          </p>
        </div>
        <fieldset
          disabled={isSubmitting}
          className="transition-opacity disabled:animate-pulse disabled:text-white/70 disabled:duration-500"
        >
          <span className="mb-6 block">
            <h2 className="-ml-2 mt-6 text-xl">Deploy</h2>
            <p className="max-w-prose text-sm leading-6 text-zinc-300">
              Essas informações serão usadas para identificar o deploy neste
              site apenas.
            </p>
          </span>
          <div className="flex flex-col">
            <Label htmlFor="deploy.name">Nome *</Label>
            <Input id="deploy.name" {...register("deploy.name")} />
            <ErrorMessage message={errors.deploy?.name?.message} />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="deploy.description">Descrição *</Label>
            <TextArea
              id="deploy.description"
              {...register("deploy.description")}
            />

            <p className="text-xs leading-6 text-zinc-300">
              Escreva as tecnologias, os repositórios, as branchs dos
              repositórios e outras informações importantes.
            </p>
            <ErrorMessage message={errors.deploy?.description?.message} />
          </div>
          <span className="mb-6 block">
            <h2 className="-ml-2 mt-6 text-xl">Domínios</h2>
            <p className="max-w-prose text-sm leading-6 text-zinc-300">
              Os domínios relacionados ao deploy serve, como metadados e
              facilitadores da próxima etapa.
            </p>
          </span>
          <span className="flex flex-col gap-1">
            {fieldsDomains.map((field, index) => (
              <div className="flex w-full flex-col gap-1" key={field.id}>
                <div className="flex w-full gap-1">
                  <button
                    className="rounded bg-red-400/10 p-1 text-red-400 hover:bg-red-400/20 focus-visible:bg-red-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                    type="button"
                    onClick={() => removeDomains(index)}
                    title={`Remover domínio ${field.value || "vazio"}`}
                  >
                    <Minus size={20} />
                  </button>
                  <Input
                    className="block h-full"
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
            className="mr-auto rounded bg-green-400/10 p-1 text-green-400 hover:bg-green-400/20 focus-visible:bg-green-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            type="button"
            onClick={() => appendDomains({ value: "" })}
          >
            <Plus size={20} />
          </button>

          <div className="-mx-8 my-8 border-b border-zinc-600" />

          <span className="mb-6 block">
            <h2 className="-ml-2 text-xl">Serviços *</h2>
            <p className="max-w-prose text-sm leading-6 text-zinc-300">
              Adicione e Configure os serviços que devem estar presentes no
              docker-compose
            </p>
          </span>
          <ul>
            {fieldsServices.map((field, index) => {
              const error =
                errors.services?.[index]?.root || errors.services?.[index];

              const errMessage =
                error?.type === "invalid_literal"
                  ? "Service needs to be either exposed or internal"
                  : undefined;

              return (
                <li key={field.id} className="flex flex-col">
                  <Service
                    index={index}
                    errors={errors}
                    register={register}
                    removeServices={removeServices}
                    watch={watch}
                    field={field}
                  />

                  <ErrorMessage message={errMessage} />
                </li>
              );
            })}
          </ul>
          <br />
          <button
            className="mr-auto rounded bg-green-400/10 p-1 text-green-400 hover:bg-green-400/20 focus-visible:bg-green-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            type="button"
            onClick={() =>
              appendServices({
                name: "",
                dockerImage: "",
                hasInternalNetwork: true,
                environmentVariables: [],
                hasExposedConfig: false,
              })
            }
          >
            <Plus size={20} />
          </button>
          <br />
          <ErrorMessage
            message={errors.services?.message || errors.services?.root?.message}
          />

          <button
            type="submit"
            className="group relative ml-auto mt-auto flex items-center gap-4 overflow-hidden rounded bg-blue-400/10 px-14 py-4 text-xl text-blue-400 hover:bg-blue-400/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            Criar
            <Rocket
              size={20}
              className={cn(
                "absolute right-9 top-1/2 -translate-x-[125%] translate-y-[125%] transition-transform duration-300 ease-out  group-hover:translate-x-0 group-hover:translate-y-0  group-focus-visible:translate-x-0 group-focus-visible:translate-y-0",
                {
                  "-translate-y-[250%] translate-x-[250%] group-hover:-translate-y-[250%] group-hover:translate-x-[250%] group-focus-visible:-translate-y-[250%] group-focus-visible:translate-x-[250%]":
                    isSubmitting,
                },
              )}
            />
          </button>

          <datalist id="common-service-names">
            <option value="structej/projetos:nome-do-projeto-x.y"></option>
            <option value="postgres:16.1-alpine3.19"></option>
            <option value="mysql:8"></option>
          </datalist>
        </fieldset>
      </form>
    </main>
  );
}
