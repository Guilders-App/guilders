import type { ApiResponse } from "@/app/api/common";
import type { Tables } from "@guilders/database/types";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["institution-connections"] as const;

type InstitutionConnection = Tables<"institution_connection"> & {
  institution: Tables<"institution">;
  provider_connection: Pick<Tables<"provider_connection">, "user_id">;
};

export function useInstitutionConnections() {
  return useQuery<InstitutionConnection[], Error>({
    queryKey: [queryKey],
    queryFn: async (): Promise<InstitutionConnection[]> => {
      const response = await fetch("/api/institution-connections");
      if (!response.ok)
        throw new Error("Failed to fetch institution connections");
      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error || "Failed to fetch institution connections",
        );
      }
      return data.data;
    },
  });
}

export function useInstitutionConnection(
  connectionId: number | null | undefined,
) {
  return useQuery<InstitutionConnection | null, Error>({
    queryKey: [...queryKey, connectionId],
    queryFn: async () => {
      if (!connectionId) return null;

      const response = await fetch(
        `/api/institution-connections/${connectionId}`,
      );
      if (!response.ok)
        throw new Error("Failed to fetch institution connection");
      const data =
        (await response.json()) as ApiResponse<InstitutionConnection>;
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch institution connection");
      }
      return data.data;
    },
    enabled: !!connectionId,
  });
}
