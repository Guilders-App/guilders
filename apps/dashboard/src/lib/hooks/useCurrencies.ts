import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "../api";

const queryKey = ["currencies"] as const;

export function useCurrencies() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const api = await getApiClient();
      const { data, error } = await (await api.currencies.$get()).json();
      if (error) throw new Error(error);
      return data;
    },
  });
}
