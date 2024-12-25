import type { Currency } from "@guilders/database/types";
import { useApiQuery } from "./useApiQuery";

const queryKey = ["currencies"] as const;

export function useCurrencies() {
  return useApiQuery<Currency[]>(queryKey, (api) => api.currencies);
}
