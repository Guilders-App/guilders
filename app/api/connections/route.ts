import { registerSnapTradeUser } from "@/lib/providers/connections";
import { createClient } from "@/lib/supabase/server";
import { getJwt } from "@/lib/utils";
import { NextResponse } from "next/server";

const providerRegistrationFunctions = {
  SnapTrade: registerSnapTradeUser,
} as const;

/**
 * @swagger
 * /api/connections:
 *   post:
 *     tags:
 *       - Connections
 *     summary: Register connections for the user
 *     description: |
 *       Register connections for the authenticated user.
 *       This will register any missing providers for the user.
 *       This is only necessary for providers that require registration.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully registered connections
 */
export async function POST(request: Request) {
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
