import { getApiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["institution-connections"] as const;

export function useInstitutionConnections() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const api = await getApiClient();
      const response = await api["institution-connections"].$get();
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
    },
  });
}

export function useInstitutionConnection(connectionId: number) {
  return useQuery({
    queryKey: [...queryKey, connectionId],
    queryFn: async () => {
      const api = await getApiClient();
      const response = await api["institution-connections"][":id"].$get({
        param: { id: connectionId.toString() },
      });
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!connectionId,
  });
}
