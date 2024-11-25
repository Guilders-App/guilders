import { createClient } from "@/lib/db/server";
import { snaptrade } from "@/lib/providers/snaptrade/client";
import { registerSnapTradeUser } from "@/lib/providers/snaptrade/register";
import { getJwt } from "@/lib/utils";
import { NextResponse } from "next/server";
import { ConnectBody } from "../../common";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const jwt = getJwt(request);

    const { institution_id }: ConnectBody = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { data: institution } = await supabase
      .from("institution")
      .select("*")
      .eq("id", institution_id)
      .single();

    if (!institution) {
      return NextResponse.json(
        { success: false, error: "Institution not found" },
        { status: 404 }
      );
    }

    let secret: string | null = null;

    let { data: providerConnection } = await supabase
      .from("provider_connection")
      .select("secret")
      .eq("provider_id", institution.provider_id)
      .eq("user_id", user.id)
      .single();

    if (!providerConnection || !providerConnection.secret) {
      try {
        const { data: registeredConnection, error } =
          await registerSnapTradeUser(user.id);
        if (error) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to register SnapTrade user: ${error}`,
            },
            { status: 500 }
          );
        }
        secret = registeredConnection?.secret ?? null;
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Error registering SnapTrade user: ${error}`,
          },
          { status: 500 }
        );
      }
    } else {
      secret = providerConnection.secret;
    }

    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Failed to get user secret" },
        { status: 500 }
      );
    }

    const brokerages = await snaptrade.referenceData.listAllBrokerages();
    const brokerage = brokerages.data?.find(
      (brokerage) => brokerage.id === institution.provider_institution_id
    );

    const response = await snaptrade.authentication.loginSnapTradeUser({
      userId: user.id,
      userSecret: secret,
      broker: brokerage?.slug,
    });

    if (!response.data || !("redirectURI" in response.data)) {
      return NextResponse.json(
        { success: false, error: "Failed to generate redirect URL" },
        { status: 500 }
      );
    }

    const redirectUrl = response.data.redirectURI;

    return NextResponse.json(
      { success: true, data: redirectUrl },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
