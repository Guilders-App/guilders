import { createClient } from "@/lib/db/server";
import { saltedge } from "@/lib/providers/saltedge/client";
import { registerSaltEdgeUser } from "@/lib/providers/saltedge/register";
import { NextResponse } from "next/server";
import { ConnectBody } from "../../common";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { institution_id }: ConnectBody = await request.json();
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

    let customerId: string | null = null;

    let { data: providerConnection } = await supabase
      .from("provider_connection")
      .select("secret")
      .eq("provider_id", institution.provider_id)
      .eq("user_id", user.id)
      .single();

    if (!providerConnection || !providerConnection.secret) {
      try {
        const { data: registeredConnection, error } =
          await registerSaltEdgeUser(user.id);
        if (error) {
          return NextResponse.json(
            {
              success: false,
              error: `Failed to register SaltEdge user: ${error}`,
            },
            { status: 500 }
          );
        }
        customerId = registeredConnection?.secret ?? null;
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Error registering SaltEdge user: ${error}`,
          },
          { status: 500 }
        );
      }
    } else {
      customerId = providerConnection.secret;
    }

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "Failed to get user customer id" },
        { status: 500 }
      );
    }

    // Use institution id to prefill connection data
    const connection = await saltedge.createConnection(
      customerId,
      institution.provider_institution_id,
      {
        institution_id: institution.id.toString(),
        user_id: user.id,
      }
    );

    if (!connection.connect_url) {
      return NextResponse.json(
        { success: false, error: "Failed to create connection" },
        { status: 500 }
      );
    }

    const redirectUrl = connection.connect_url;
    return NextResponse.json(
      { success: true, data: redirectUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
