import { useQuery } from "@tanstack/react-query";

interface ExchangeRates {
  [key: string]: number;
}

const queryKey = ["exchangeRates"] as const;

export function useExchangeRates() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch("/api/exchange-rates");
      if (!response.ok) throw new Error("Failed to fetch exchange rates");
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch exchange rates");
      }
      return data.rates as ExchangeRates;
    },
  });
}
