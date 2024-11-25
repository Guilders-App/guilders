import { createClient } from "@/lib/db/client";
import { useQuery } from "@tanstack/react-query";

const queryKey = ["user-metadata"] as const;

export interface UserMetadata {
  email: string;
  currency: string;
}

export function useUser() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = createClient();
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
