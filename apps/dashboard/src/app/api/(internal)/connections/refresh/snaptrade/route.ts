import {
  providerName as snapTradeProviderName,
  snaptrade,
} from "@/lib/providers/snaptrade/client";
import { createClient } from "@guilders/database/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { institutionConnectionId } = await request.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!institutionConnectionId) {
    return NextResponse.json(
      { success: false, error: "Institution connection ID is required" },
      { status: 400 },
    );
  }

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 },
    );
  }

  const { data: provider } = await supabase
    .from("provider")
    .select("id")
    .eq("name", snapTradeProviderName)
    .single();

  if (!provider) {
    return NextResponse.json(
      { success: false, error: "SnapTrade provider not found" },
      { status: 404 },
    );
  }

  const { data: providerConnection } = await supabase
    .from("provider_connection")
    .select("*")
    .eq("provider_id", provider.id)
    .eq("user_id", user.id)
    .single();

  if (!providerConnection || !providerConnection.secret) {
    return NextResponse.json(
      { success: false, error: "SnapTrade connection not found" },
      { status: 404 },
    );
  }

  const { data: institutionConnection } = await supabase
    .from("institution_connection")
    .select("*")
    .eq("id", institutionConnectionId)
    .single();

  if (!institutionConnection || !institutionConnection.connection_id) {
    return NextResponse.json(
      { success: false, error: "Institution connection not found" },
      { status: 404 },
    );
  }

  try {
    const { status } =
      await snaptrade.connections.refreshBrokerageAuthorization({
        authorizationId: institutionConnection.connection_id,
        userId: user.id,
        userSecret: providerConnection.secret,
      });

    if (status !== 200) {
      return NextResponse.json(
        { success: false, error: "Failed to refresh SnapTrade connection" },
        { status },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh SnapTrade connection" },
      { status: 500 },
    );
  }
}
