import { createClient } from "@/lib/db/client";
import { Tables } from "@/lib/db/database.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const queryKey = ["user-settings"] as const;

export type UserSettings = Tables<"user_settings">;

export function useUser() {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(authError);
        throw authError;
      }
      if (!user) throw new Error("No user found");

      let settings: UserSettings;
      const { data: userSettings, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        const { data: userSettings, error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.id,
            currency: "EUR",
          })
          .select()
          .single();

        if (insertError) {
          console.error(insertError);
          throw insertError;
        }

        settings = userSettings;
      } else {
        settings = userSettings;
      }

      if (!settings) throw new Error("No user settings found");

      return {
        email: user.email ?? "",
        ...settings,
      };
    },
  });
}

interface UpdateUserSettingsInput {
  email?: string;
  password?: string;
  currency?: string;
  apiKey?: string | null;
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateUserSettingsInput) => {
      const supabase = await createClient();

      // Handle auth updates (email/password) if provided
      if (input.email || input.password) {
        const { error: authError } = await supabase.auth.updateUser({
          email: input.email,
          password: input.password,
        });
        if (authError) throw authError;
      }

      // Handle settings updates if currency or apiKey is provided
      if (input.currency !== undefined || input.apiKey !== undefined) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const updateData: { currency?: string; api_key?: string | null } = {};

        if (input.currency !== undefined) {
          updateData.currency = input.currency.toUpperCase();
        }

        if (input.apiKey !== undefined) {
          updateData.api_key = input.apiKey;
        }

        const { data: settings, error: settingsError } = await supabase
          .from("user_settings")
          .update(updateData)
          .eq("user_id", user.id)
          .select()
          .single();

        if (settingsError) throw settingsError;
        if (!settings) throw new Error("Failed to update settings");

        return {
          email: user.email ?? "",
          ...settings,
        };
      }

      // If only auth was updated, fetch the latest settings
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: settings, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (!settings) throw new Error("No user settings found");

      return {
        email: user.email ?? "",
        ...settings,
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/user", {
        method: "DELETE",
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to delete account");
      }

      return data;
    },
  });
}
