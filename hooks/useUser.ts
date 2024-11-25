import { createClient } from "@/lib/db/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const queryKey = ["user-metadata"] as const;

export interface UserMetadata {
  email: string;
  currency: string;
}

export function useUser() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = await createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;
      if (!user) throw new Error("No user found");

      return {
        email: user.email,
        currency: user.user_metadata.currency?.toUpperCase() ?? "EUR",
      } as UserMetadata;
    },
  });
}

interface UpdateUserSettingsInput {
  email?: string;
  password?: string;
  currency?: string;
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateUserSettingsInput) => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.updateUser({
        email: input.email,
        password: input.password,
        data: {
          currency: input.currency?.toUpperCase(),
        },
      });

      if (error) throw error;
      if (!user) throw new Error("No user found");

      return {
        email: user.email,
        currency: user.user_metadata.currency?.toUpperCase() ?? "EUR",
      } as UserMetadata;
    },
    onSuccess: (data) => {
      // Update the cache with the new user data
      queryClient.setQueryData(queryKey, data);
    },
  });
}
