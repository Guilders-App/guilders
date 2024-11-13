import { Tables } from "@/lib/supabase/database.types";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useRegisterUser() {
  return useMutation({
    mutationFn: async (providerName: string) => {
      const response = await fetch(
        `/api/connections/register/${providerName}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error || `Failed to register a ${providerName} user`
        );
      }
      return data;
    },
  });
}

export function useDeregisterUser() {
  return useMutation({
    mutationFn: async (providerName: string) => {
      const response = await fetch(
        `/api/connections/deregister/${providerName.toLowerCase()}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error || `Failed to deregister a ${providerName} user`
        );
      }
      return data;
    },
  });
}

type Connection = Tables<"provider_connection"> & {
  provider: Tables<"provider">;
};

export function useGetConnections() {
  return useQuery<Connection[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await fetch("/api/connections");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch connections");
      }
      return data.data;
    },
  });
}
