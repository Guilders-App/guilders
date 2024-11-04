import { ConnectionProviderFunction } from "@/lib/providers/types";
import { createClient } from "@/lib/supabase/server";
import { getJwt } from "@/lib/utils";
import { NextResponse } from "next/server";

export const registerConnection = async (
  providerName: string,
  registerFunction: ConnectionProviderFunction,
  request: Request
) => {
  try {
    const supabase = await createClient();
    const jwt = getJwt(request);
    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { data: provider } = await supabase
      .from("provider")
      .select("id")
      .eq("name", providerName)
      .single();

    if (!provider) {
      return NextResponse.json(
        { success: false, error: `Provider ${providerName} not found` },
        { status: 500 }
      );
    }

    const { data: connection } = await supabase
      .from("connection")
      .select("*")
      .eq("provider_id", provider.id)
      .eq("user_id", user.id)
      .single();

    if (connection) {
      return NextResponse.json({ success: true });
    }

    await registerFunction(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Error during registration" },
      { status: 500 }
    );
  }
};
