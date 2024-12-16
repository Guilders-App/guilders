import { createClient } from "@guilders/database/server";
import type { Database } from "@guilders/database/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export type SupabaseClientType = SupabaseClient<Database>;

type AuthResult = {
  client: SupabaseClientType | null;
  userId: string | null;
  error: NextResponse | null;
};

/**
 * Validates an API key and returns the associated user ID if valid
 * @param apiKey - The API key to validate
 * @returns The user ID if valid, null if invalid
 */
export async function validateApiKey(apiKey: string): Promise<string | null> {
  const supabase = await createClient({ admin: true });

  const { data: userSettings, error } = await supabase
    .from("user_setting")
    .select("user_id")
    .eq("api_key", apiKey)
    .single();

  if (error || !userSettings) {
    return null;
  }

  return userSettings.user_id;
}

export async function authenticate(request: Request): Promise<AuthResult> {
  const apiKey = request.headers.get("X-Api-Key");

  // Try API key authentication first
  if (apiKey) {
    const userId = await validateApiKey(apiKey);
    if (userId) {
      return {
        userId,
        client: await createClient({ admin: true }),
        error: null,
      };
    }
  }

  // Fall back to session authentication
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      userId: null,
      client: null,
      error: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  return {
    userId: user.id,
    client: supabase,
    error: null,
  };
}
