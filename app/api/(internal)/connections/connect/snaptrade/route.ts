import { createClient } from "@/lib/db/server";
import { snaptrade } from "@/lib/providers/snaptrade/client";
import { registerSnapTradeUser } from "@/lib/providers/snaptrade/register";
import { NextResponse } from "next/server";
import { ConnectBody } from "../../common";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { institution_id, account_id }: ConnectBody = await request.json();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    let reconnect: string | undefined = undefined;

    if (account_id) {
      const { data: account, error: accountError } = await supabase
        .from("account")
        .select("*")
        .eq("id", account_id)
        .single();

      if (accountError || !account || !account.institution_connection_id) {
        return NextResponse.json(
          { success: false, error: "Account not found" },
          { status: 404 }
        );
      }

      const { data: institutionConnection, error: institutionConnectionError } =
        await supabase
          .from("institution_connection")
          .select("*")
          .eq("id", account.institution_connection_id)
          .single();

      if (institutionConnectionError || !institutionConnection) {
        return NextResponse.json(
          { success: false, error: "Institution connection not found" },
          { status: 404 }
        );
      }

      reconnect = institutionConnection.connection_id ?? undefined;
    }

    const brokerages = await snaptrade.referenceData.listAllBrokerages();
    const brokerage = brokerages.data?.find(
      (brokerage) => brokerage.id === institution.provider_institution_id
    );

    const response = await snaptrade.authentication.loginSnapTradeUser({
      userId: user.id,
      userSecret: secret,
      broker: brokerage?.slug,
      reconnect: reconnect,
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
