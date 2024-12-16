import { Tables } from "@/apps/web/lib/db/database.types";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useRegisterUser() {
  return useMutation({
    mutationFn: async (providerName: string) => {
      const response = await fetch(
        `/api/connections/register/${providerName.toLowerCase()}`,
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

export function useCreateConnection() {
  return useMutation({
    mutationFn: async ({
      providerName,
      institutionId,
    }: {
      providerName: string;
      institutionId: number;
    }) => {
      const response = await fetch(
        `/api/connections/connect/${providerName.toLowerCase()}`,
        {
          method: "POST",
          body: JSON.stringify({ institution_id: institutionId }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        console.error(data.error);
        throw new Error(`Failed to create a ${providerName} connection`);
      }

      return data;
    },
  });
}

export function useFixConnection() {
  return useMutation({
    mutationFn: async ({
      providerName,
      institutionId,
      accountId,
    }: {
      providerName: string;
      institutionId: number;
      accountId: number;
    }) => {
      const response = await fetch(
        `/api/connections/connect/${providerName.toLowerCase()}`,
        {
          method: "POST",
          body: JSON.stringify({
            institution_id: institutionId,
            account_id: accountId,
          }),
        }
      );

      const data = await response.json();
      if (!data.success) {
        console.error(data.error);
        throw new Error(`Failed to fix a ${providerName} connection`);
      }

      return data;
    },
  });
}

export function useRefreshConnection() {
  return useMutation({
    mutationFn: async ({
      providerName,
      institutionConnectionId,
    }: {
      providerName: string;
      institutionConnectionId: number;
    }) => {
      const response = await fetch(
        `/api/connections/refresh/${providerName.toLowerCase()}`,
        {
          method: "POST",
          body: JSON.stringify({ institutionConnectionId }),
        }
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to refresh the connection");
      }
      return data;
    },
  });
}
