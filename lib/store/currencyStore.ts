import { Tables } from "@/lib/supabase/database.types";
import { create } from "zustand";

type Currency = Omit<Tables<"currency">, "id">;

interface CurrencyState {
  currencies: Currency[];
  isLoading: boolean;
  error: string | null;
  fetchCurrencies: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currencies: [],
  isLoading: false,
  error: null,

  fetchCurrencies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/currencies");
      if (!response.ok) throw new Error("Failed to fetch currencies");
      const data = await response.json();
      if (data.success) {
        set({ currencies: data.currencies, isLoading: false });
      } else {
        throw new Error(data.error || "Failed to fetch currencies");
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
