import { registerSnapTradeUser } from "@/lib/providers/connections";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const providerRegistrationFunctions = {
  SnapTrade: registerSnapTradeUser,
} as const;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get all existing connections with provider names
    const { data: connections } = await supabase.from("connection").select(`
        provider_id,
        provider_details:provider(name)
      `);

    // Get all existing provider names
    const existingProviderNames = new Set(
      connections?.map((conn) => conn.provider_details?.name) || []
    );

    // Get all available providers
    const { data: providers } = await supabase
      .from("provider")
      .select("id, name");

    if (!providers) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch providers" },
        { status: 500 }
      );
    }

    // Find missing providers
    const missingProviders = providers.filter(
      (provider) => !existingProviderNames.has(provider.name)
    );

    // Register missing providers
    for (const provider of missingProviders) {
      const registrationFunction =
        providerRegistrationFunctions[
          provider.name as keyof typeof providerRegistrationFunctions
        ];
      if (registrationFunction) {
        const result = await registrationFunction(user.id);
        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error },
            { status: 500 }
          );
        }
      } else {
        console.error(
          `No registration function found for ${provider.name} provider`
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Error during registration" },
      { status: 500 }
    );
  }
}
