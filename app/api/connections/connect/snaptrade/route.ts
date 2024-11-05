import { snaptrade } from "@/lib/providers/snaptrade/client";
import { registerSnapTradeUser } from "@/lib/providers/snaptrade/register";
import { createClient } from "@/lib/supabase/server";
import { getJwt } from "@/lib/utils";
import { NextResponse } from "next/server";

type ConnectBody = {
  institution_id: string;
};

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
      .eq("institution_id", institution_id)
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
      const { data: registeredConnection } = await registerSnapTradeUser(
        user.id
      );
      secret = registeredConnection?.secret ?? null;
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
      (brokerage) => brokerage.id === institution.institution_id
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
