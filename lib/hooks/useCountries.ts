import { Tables } from "@/lib/db/database.types";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["countries"] as const;

export function useCountries() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/countries");
      if (!response.ok) throw new Error("Failed to fetch countries");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch countries");
      }
      return data.countries as Tables<"country">[];
    },
  });
}
