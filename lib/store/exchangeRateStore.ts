import { create } from "zustand";

interface ExchangeRates {
  [key: string]: number;
}

interface ExchangeRateState {
  rates: ExchangeRates;
  isLoading: boolean;
  error: string | null;
  fetchExchangeRates: () => Promise<void>;
}

export const useExchangeRateStore = create<ExchangeRateState>((set) => ({
  rates: {},
  isLoading: false,
  error: null,

  fetchExchangeRates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/exchange-rates");
      if (!response.ok) throw new Error("Failed to fetch exchange rates");
      const data = await response.json();
      if (data.success) {
        set({ rates: data.rates, isLoading: false });
      } else {
        throw new Error(data.error || "Failed to fetch exchange rates");
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
