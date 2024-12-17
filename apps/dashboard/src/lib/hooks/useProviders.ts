import type { Provider } from "@guilders/database/types";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["providers"] as const;
const singleProviderKey = (id: number) => ["provider", id] as const;

export function useProviders() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/providers");
      if (!response.ok) throw new Error("Failed to fetch providers");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch providers");
      }
      return data.data as Provider[];
    },
  });
}

export function useProvider(id: number | undefined) {
  return useQuery({
    queryKey: singleProviderKey(id ?? -1),
    queryFn: async () => {
      const response = await fetch(`/api/providers/${id}`);
      if (!response.ok) throw new Error("Failed to fetch provider");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch provider");
      }
      return data.data as Provider;
    },
    enabled: !!id,
  });
}
