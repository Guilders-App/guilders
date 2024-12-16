import { createClient } from "@/apps/web/lib/db/client";
import { Tables } from "@/apps/web/lib/db/database.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const queryKey = ["user-settings"] as const;

export type UserSettings = Tables<"user_setting">;
export type UserSubscription = Tables<"subscription">;

export type UserData = {
  email: string;
  settings: UserSettings;
  subscription: UserSubscription | null;
};

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

      // Fetch user settings
      const { data: settings, error: settingsError } = await supabase
        .from("user_setting")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (settingsError) {
        // Create default settings if none exist
        const { data: newSettings, error: insertError } = await supabase
          .from("user_setting")
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

        if (!newSettings) throw new Error("Failed to create user settings");

        return {
          email: user.email ?? "",
          settings: newSettings,
          subscription: null,
        };
      }

      if (!settings) throw new Error("No user settings found");

      // Fetch subscription data
      const { data: subscription } = await supabase
        .from("subscription")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return {
        email: user.email ?? "",
        settings,
        subscription: subscription ?? null,
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
          .from("user_setting")
          .update(updateData)
          .eq("user_id", user.id)
          .select()
          .single();

        if (settingsError) throw settingsError;
        if (!settings) throw new Error("Failed to update settings");

        // Fetch subscription data
        const { data: subscription } = await supabase
          .from("subscription")
          .select("*")
          .eq("user_id", user.id)
          .single();

        return {
          email: user.email ?? "",
          settings,
          subscription,
        };
      }

      // If only auth was updated, fetch the latest settings
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: settings, error } = await supabase
        .from("user_setting")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (!settings) throw new Error("No user settings found");

      // Fetch subscription data
      const { data: subscription } = await supabase
        .from("subscription")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return {
        email: user.email ?? "",
        settings,
        subscription,
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
