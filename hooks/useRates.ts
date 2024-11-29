import { useQuery } from "@tanstack/react-query";

const queryKey = ["rates"] as const;

type Rate = {
  currency_code: string;
  rate: number;
};

export function useRates() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/rates");
      if (!response.ok) throw new Error("Failed to fetch rates");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch currencies");
      }
      return data.data as Rate[];
    },
  });
}
