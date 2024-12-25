import type { Tables } from "@guilders/database/types";
import { useApiQuery } from "./useApiQuery";

const queryKey = ["institution-connections"] as const;

type InstitutionConnection = Tables<"institution_connection"> & {
  institution: Tables<"institution">;
  provider_connection: Pick<Tables<"provider_connection">, "user_id">;
};

export function useInstitutionConnections() {
  return useApiQuery<InstitutionConnection[]>(
    queryKey,
    (api) => api["institution-connections"],
  );
}

export function useInstitutionConnection(connectionId: number) {
  return useApiQuery<InstitutionConnection | null>(
    [...queryKey, connectionId],
    (api) => ({
      $get: () =>
        api["institution-connections"][":id"].$get({
          param: { id: connectionId.toString() },
        }),
    }),
    { enabled: !!connectionId },
  );
}
