import { createAdminClient } from "@/lib/db/admin";
import { Tables } from "@/lib/db/database.types";
import { createClient } from "@/lib/db/server";
import { NextResponse } from "next/server";
import { deregisterConnection } from "../connections/common";

export async function DELETE() {
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: connections, error: connectionsError } = await supabase
    .from("provider_connection")
    .select(
      `
      *,
      provider:provider_id (
        name
      )
    `
    )
    .eq("user_id", user.id)
    .returns<
      Tables<"provider_connection"> &
        {
          provider: { name: string };
        }[]
    >();

  if (connectionsError || !connections)
    return NextResponse.json(
      { success: false, error: "Failed to fetch connections" },
      { status: 500 }
    );

  for (const connection of connections) {
    const response = await deregisterConnection(connection.provider.name);

    if (response.status !== 200) {
      return response;
    }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
