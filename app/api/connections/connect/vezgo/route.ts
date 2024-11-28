import { createClient } from "@/lib/db/server";
import { vezgo } from "@/lib/providers/vezgo/client";
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

    // Get the connect URL from Vezgo for the specific institution
    const login = vezgo.login(user.id);

    // @ts-ignore
    const connectData = await login.getConnectData({
      provider: institution.provider_institution_id,
    });

    return NextResponse.json(
      { success: true, data: connectData.url + "&token=" + connectData.token },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error connecting to Vezgo:", error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
