import { Institution } from "@/lib/db/types";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["institutions"] as const;

export function useInstitutions() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/institutions");
      if (!response.ok) throw new Error("Failed to fetch institutions");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch institutions");
      }
      return data.data as Institution[];
    },
  });
}
