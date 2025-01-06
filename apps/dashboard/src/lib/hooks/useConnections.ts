import { getApiClient } from "@/lib/api";
import type { ConnectionResponse } from "@guilders/api/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const queryKey = ["connections"] as const;

export function useRegisterConnection() {
  return useMutation({
    mutationFn: async (provider: string) => {
      const api = await getApiClient();
      const response = await api.connections.register.$post({
        json: { provider },
      });
      const { data, error } = await response.json();
      if (error || !data)
        throw new Error(error || "Failed to register connection");
      return data;
    },
    onError: (error) => {
      toast.error("Failed to register connection", {
        description: error.message,
      });
    },
  });
}

export function useDeregisterConnection() {
  return useMutation({
    mutationFn: async (provider: string) => {
      const api = await getApiClient();
      const response = await api.connections.deregister.$post({
        json: { provider },
      });
      const { data, error } = await response.json();
      if (error || !data)
        throw new Error(error || "Failed to deregister connection");

      return data;
    },
    onError: (error) => {
      toast.error("Failed to deregister connection", {
        description: error.message,
      });
    },
  });
}

export function useCreateConnection() {
  return useMutation({
    mutationFn: async ({
      provider,
      institutionId,
    }: {
      provider: string;
      institutionId: string;
    }): Promise<ConnectionResponse> => {
      const api = await getApiClient();
      const response = await api.connections.$post({
        json: { provider, institution_id: institutionId },
      });
      const { data, error } = await response.json();
      console.error(data, error);
      console.error(response);
      if (error || !data) {
        throw new Error(error || "Failed to create connection");
      }

      return data;
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to create connection", {
        description: error.message,
      });
    },
  });
}

export function useReconnectConnection() {
  return useMutation({
    mutationFn: async ({
      provider,
      institutionId,
      accountId,
    }: {
      provider: string;
      institutionId: string;
      accountId: string;
    }): Promise<ConnectionResponse> => {
      const api = await getApiClient();
      const response = await api.connections.reconnect.$post({
        json: { provider, institution_id: institutionId, account_id: accountId },
      });
      const { data, error } = await response.json();
      if (error || !data) throw new Error(error || "Failed to reconnect");

      return data;
    },
    onError: (error) => {
      toast.error("Failed to reconnect", {
        description: error.message,
      });
    },
  });
}

export function useRefreshConnection() {
  return useMutation({
    mutationFn: async ({
      provider,
      institutionId,
      connectionId,
    }: {
      provider: string;
      institutionId: string;
      connectionId: string;
    }): Promise<void> => {
      const api = await getApiClient();
      const response = await api.connections.refresh.$post({
        json: { provider, institution_id: institutionId, connection_id: connectionId },
      });
      const { error } = await response.json();
      if (error) throw new Error(error);
    },
    onError: (error) => {
      toast.error("Failed to refresh connection", {
        description: error.message,
      });
    },
    onSuccess: () => {
      toast.success("Connection refreshed", {
        description: "Your connection has been refreshed successfully.",
      });
    },
  });
}
