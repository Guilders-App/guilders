import { getApiClient } from "@/lib/api";
import type { TransactionCategory } from "@guilders/api/types";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["transaction-categories"] as const;

export function useTransactionCategories() {
  return useQuery({
    queryKey,
    queryFn: async (): Promise<TransactionCategory[]> => {
      const api = await getApiClient();
      const response = await api["transaction-categories"].$get();
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
    },
  });
}
