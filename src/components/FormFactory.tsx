import React, {
  useState,
  type ChangeEvent,
  type FormEvent,
  type HTMLProps,
  Dispatch,
  SetStateAction,
  FC,
} from "react";
import { ZodSchema, type ZodError, type ZodType, type z } from "zod";

type OnValidSubmitFn<SchemaType extends ZodType> = (
  formInfo: z.output<SchemaType>,
) => void;

type OnInvalidSubmitFn = (error: ZodError) => void;

export type FormFactoryInfo<SchemaType extends ZodType> = {
  schema: SchemaType;
  fields: FieldsInfo<SchemaType>;
};

type FieldsInfo<SchemaType extends ZodType> = {
  [key in keyof z.output<SchemaType>]: key extends "label" | "transform"
    ? never
    : z.output<SchemaType>[key] extends object
      ? FieldsInfo<
          ZodType<
            z.output<SchemaType>[key],
            z.ZodTypeDef,
            z.input<SchemaType>[key]
          >
        > & { transform?: undefined }
      : {
          label: string;
          defaultValue: z.output<SchemaType>[key];
          inputAtrr?: HTMLProps<HTMLInputElement>;
        } & (z.output<SchemaType>[key] extends string
          ? { transform?: (arg: string) => string }
          : {
              transform: (arg: string) => z.output<SchemaType>[key];
            });
};

export function FormFactory<SchemaType extends ZodType>({
  fields,
  schema,
}: FormFactoryInfo<SchemaType>) {
  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
    formInfo: z.output<SchemaType>,
    onValidSubmit: OnValidSubmitFn<SchemaType>,
    onInvalidSubmit: OnInvalidSubmitFn,
    setErrors: (error: ZodError | null) => void,
  ) => {
    event.preventDefault();

    const response = schema.safeParse(formInfo);
    if (response.success) {
      onValidSubmit(formInfo);
    } else {
      alert(JSON.stringify(response.error.flatten()));
      setErrors(response.error);
      onInvalidSubmit(response.error);
    }
  };

  // É comum HOC (High Order Components) dar problema com fast refresh/hot reload
  return function FormComponent({
    onValidSubmit,
    onInvalidSubmit,
    buttonContent,
    formInfo,
    setFormInfo,
  }: {
    onValidSubmit: OnValidSubmitFn<SchemaType>;
    onInvalidSubmit: OnInvalidSubmitFn;
    buttonContent?: string;
    formInfo: z.output<SchemaType>;
    setFormInfo: Dispatch<SetStateAction<z.output<SchemaType>>>;
  }) {
    const defaultFormInfo = Object.entries(fields).reduce(
      (
        acc,
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key, fieldInfo]: [keyof z.output<typeof schema>, any],
      ) => ({
        ...acc,
        //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        [key]: fieldInfo.defaultValue, // eslint-disable-line @typescript-eslint/no-unsafe-assignment
      }),
      {},
    );

    if (!formInfo) {
      setFormInfo(defaultFormInfo);
      return;
    }

    const [errors, setErrors] = useState<ZodError | null>(null);

    function mapFields(
      fields: FieldsInfo<ZodSchema>,
      formValues?: typeof formInfo,
      setFormValues?: typeof setFormInfo,
    ): React.JSX.Element[] {
      const set = setFormValues;
      const formV = formValues ?? formInfo;

      const handleChange = (
        value: string,
        key: keyof FieldsInfo<SchemaType>,
      ) => {
        const transf = fields[key].transform;

        set &&
          set((pr) => ({
            ...pr,
            [key]: transf ? transf(value) : value,
          }));
        !set &&
          setFormInfo((pr) => ({
            ...pr,
            [key]: transf ? transf(value) : value,
          }));
      };

      return Object.entries(fields).reduce(
        (
          prev: React.JSX.Element[],
          [key, fieldInfo]: [string, (typeof fields)[string]],
          i,
        ) => {
          if (!("label" in fieldInfo) || typeof fieldInfo["label"] !== "string")
            return [
              ...prev,
              ...mapFields(
                fields[key] as FieldsInfo<SchemaType>,
                formV[key],
                (f) =>
                  handleChange(
                    typeof f !== "function" ? f : (f as any)(formV[key]),
                    key,
                  ),
              ),
              <span className="p-1 text-red-400" key={key + i}>
                {errors?.flatten().fieldErrors[key]?.map((error, i) => (
                  <p className="max-w-[25ch]" key={error + i}>
                    {error}
                  </p>
                ))}
              </span>,
            ];

          const { label, inputAtrr } = fieldInfo;

          return [
            ...prev,
            <div key={key} className="flex flex-col">
              <label
                className="pb-1 pt-4 text-white text-opacity-80"
                htmlFor={key}
              >
                {label}
              </label>
              <input
                key={key}
                className="rounded-sm bg-zinc-800 p-2 text-white focus-visible:outline focus-visible:outline-neutral-300"
                id={key}
                value={formV[key]}
                onChange={(event) => handleChange(event.target.value, key)}
                {...inputAtrr}
              />
              <span className="p-1 text-red-400">
                {errors?.flatten().fieldErrors[key]?.map((error) => (
                  <p className="max-w-[25ch]" key={error}>
                    {error}
                  </p>
                ))}
              </span>
            </div>,
          ];
        },
        [] as React.JSX.Element[],
      );
    }

    return (
      <form
        className="rounded-md bg-zinc-900 p-4 text-white"
        onSubmit={(event) =>
          handleSubmit(
            event,
            formInfo,
            onValidSubmit,
            onInvalidSubmit,
            setErrors,
          )
        }
      >
        {mapFields(fields)}
        <span className="p-1 text-red-400">
          {errors?.flatten().formErrors?.map((error) => (
            <p className="max-w-[25ch]" key={error}>
              {error}
            </p>
          ))}
        </span>
        <button
          className="mt-6 w-full rounded-md bg-zinc-800 p-2"
          type="submit"
        >
          {buttonContent || "Enviar"}
        </button>
      </form>
    );
  };
}
