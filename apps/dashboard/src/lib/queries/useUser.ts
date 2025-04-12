import type { UpdateUser } from "@guilders/api/types";
import { createClient } from "@guilders/database/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiClient } from "../api";
import { env } from "../env";

const queryKey = ["user-settings"] as const;

export function useUser() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const api = await getApiClient();
      const response = await api.users.me.$get();
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
    },
  });
}

export function useUserToken() {
  return useQuery({
    queryKey: ["user-token"],
    queryFn: async () => {
      const supabase = createClient({
        url: env.NEXT_PUBLIC_SUPABASE_URL,
        key: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      return token;
    },
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateUser) => {
      const api = await getApiClient();
      const response = await api.users.me.$patch({ json: input });
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const api = await getApiClient();
      const response = await api.users.me.$delete();
      const { data, error } = await response.json();
      if (error) throw new Error(error);
      return data;
    },
  });
}
