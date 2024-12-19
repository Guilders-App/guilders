import { createClient } from "@guilders/database/client";
import type { Tables } from "@guilders/database/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

const queryKey = ["currencies"] as const;

export function useCurrencies() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const testResponse = await api.currencies.index.get({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(testResponse.data);
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

// export function useCurrencies() {
//   return useQuery({
//     queryKey,
//     queryFn: api.currencies.index.get,
//   });
// }
