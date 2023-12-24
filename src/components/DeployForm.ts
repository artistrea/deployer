import { z } from "zod";
import { FormFactory } from "./FormFactory";

const schema = z.object({
  deploy: z.object({
    name: z.string().min(1).max(64),
    description: z.string().min(1).max(65535),
  }),
  // deployDomains: z.array(z.string()),
  // services: z.array(
  //   z.object({
  //     name: z.string().min(1).max(32),
  //     dockerImage: z.string().min(1).max(64),
  //     hasInternalNetwork: z.boolean(),
  //   }),
  // ),
});

export type DeploySchema = z.infer<typeof schema>;

export const DeployForm = FormFactory({
  fields: {
    deploy: {
      description: {
        defaultValue: "",
        label: "Descrição do Deploy",
      },
      name: {
        defaultValue: "",
        label: "Nome do Deploy",
      },
    },
    // deployDomains: {},
  },
  schema,
});
