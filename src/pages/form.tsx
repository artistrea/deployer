import { useState } from "react";
import { DeployForm, DeploySchema } from "~/components/DeployForm";

export default function FormPage() {
  const [formInfo, setFormInfo] = useState<DeploySchema>({
    deploy: {
      description: "",
      name: "",
    },
  });

  return (
    <DeployForm
      onInvalidSubmit={(a) => {
        // alert(JSON.stringify(a));
      }}
      onValidSubmit={() => {}}
      formInfo={formInfo}
      setFormInfo={setFormInfo}
    />
  );
}
