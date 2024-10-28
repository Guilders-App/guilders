import { registerSnapTradeUser } from "@/lib/providers/connections";
import { Enums } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

// Add aggregator registration function mapping
const aggregatorRegistrationFunctions = {
  SnapTrade: registerSnapTradeUser,
  // Plaid: registerPlaidUser, // Add other aggregator registration functions as needed
} as const;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get all existing connections for the user
    const connections = await supabase
      .from("connection")
      .select("*")
      .eq("user_id", user.id);

    // Get all registered aggregators
    const existingAggregators = new Set(
      connections.data?.map((conn) => conn.aggregator) || []
    );

    // Get all available aggregators from the enum
    const allAggregators: Enums<"aggregator">[] = [
      "SnapTrade",
      "Plaid",
    ] as const;

    // Find missing aggregators
    const missingAggregators = allAggregators.filter(
      (agg) => !existingAggregators.has(agg)
    );

    // Register missing aggregators
    for (const aggregator of missingAggregators) {
      const registrationFunction =
        aggregatorRegistrationFunctions[
          aggregator as keyof typeof aggregatorRegistrationFunctions
        ];
      if (registrationFunction) {
        const result = await registrationFunction(supabase, user.id);
        if (!result.success) {
          return Response.json(
            { success: false, error: result.error },
            { status: 500 }
          );
        }
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json(
      { success: false, error: "Error during registration" },
      { status: 500 }
    );
  }
}
