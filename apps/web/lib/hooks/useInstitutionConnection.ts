import { Tables } from "@/apps/web/lib/db/database.types";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["institution-connections"] as const;

type InstitutionConnection = Tables<"institution_connection"> & {
  institution: Tables<"institution">;
};

type InstitutionConnectionsResponse = {
  connections: InstitutionConnection[];
};

type SingleInstitutionConnectionResponse = {
  connection: InstitutionConnection;
};

export function useInstitutionConnections() {
  return useQuery<InstitutionConnection[], Error>({
    queryKey: [queryKey],
    queryFn: async (): Promise<InstitutionConnection[]> => {
      const response = await fetch("/api/institution-connections");
      if (!response.ok)
        throw new Error("Failed to fetch institution connections");
      const data = (await response.json()) as InstitutionConnectionsResponse;
      return data.connections;
    },
  });
}

export function useInstitutionConnection(
  connectionId: number | null | undefined
) {
  return useQuery({
    queryKey: [...queryKey, connectionId],
    queryFn: async () => {
      if (!connectionId) return null;

      const response = await fetch(
        `/api/institution-connections/${connectionId}`
      );
      if (!response.ok)
        throw new Error("Failed to fetch institution connection");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch institution connection");
      }
      return data.data;
    },
    enabled: !!connectionId,
  });
}
