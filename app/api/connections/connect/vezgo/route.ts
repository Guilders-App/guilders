import { createClient } from "@/lib/db/server";
import { vezgoClient } from "@/lib/providers/vezgo/client";
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

    // Get the connect URL from Vezgo for the specific institution
    const connectUrl = vezgoClient.getConnectUrl(user.id, institution_id);

    return NextResponse.json(
      { success: true, data: connectUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error connecting to Vezgo:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
