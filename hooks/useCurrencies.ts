import { Tables } from "@/lib/db/database.types";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["currencies"] as const;

export function useCurrencies() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/currencies");
      if (!response.ok) throw new Error("Failed to fetch currencies");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch currencies");
      }
      return data.currencies as Tables<"currency">[];
    },
  });
}
