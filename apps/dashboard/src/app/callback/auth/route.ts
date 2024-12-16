import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import { createClient } from "@guilders/database/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = searchParams.get("redirect_to") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Create user settings if they don't exist
      if (data?.user) {
        const { error: settingsError } = await supabase
          .from("user_setting")
          .upsert({
            user_id: data.user.id,
          });

        if (settingsError) {
          console.error("Failed to create user settings:", settingsError);
        }
      }

      redirect(redirectTo);
    }
  }

  redirect("/error");
}
