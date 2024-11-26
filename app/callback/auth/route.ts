import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = searchParams.get("redirect_to") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    console.log("Error:", error);
    if (!error) {
      if (type === "email_change") {
        console.log("Email change");
      }

      redirect(redirectTo);
    }
  }

  redirect("/error");
}
