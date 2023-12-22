import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function DeployPage() {
  const router = useRouter();

  const { id } = router.query;

  const { data: deploy } = api.deploy.get.useQuery(Number(id));

  return (
    <div>
      {deploy ? (
        <div>
          {deploy.name} - {deploy.version}
        </div>
      ) : (
        "Carregando..."
      )}
    </div>
  );
}
