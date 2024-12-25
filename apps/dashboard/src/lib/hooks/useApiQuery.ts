import { getApiClient } from "@/lib/api";
import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from "@tanstack/react-query";

type ApiEndpoint = {
  $get: (options?: {
    param?: Record<string, string | number>;
  }) => Promise<Response>;
};

export function useApiQuery<TData = unknown>(
  queryKey: QueryKey,
  endpoint: (api: Awaited<ReturnType<typeof getApiClient>>) => ApiEndpoint,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const api = await getApiClient();
      const { data, error } = await endpoint(api)
        .$get()
        .then((res) => res.json());
      if (error) throw new Error(error);
      return data as TData;
    },
    ...options,
  });
}
