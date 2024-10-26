import { TablesUpdate } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { AccountUpdate } from "@/lib/supabase/types";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const accountId = params.id;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { data: account, error } = await supabase
      .from("account")
      .select("*")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Error fetching account:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const accountId = params.id;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from("account")
      .delete()
      .eq("id", accountId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error deleting account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting account" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const accountId = params.id;
    const updatedData: AccountUpdate = await request.json();
    const dataToUpdate: TablesUpdate<"account"> = { ...updatedData };

    // Check if subtype is present and update type accordingly
    if (updatedData.subtype) {
      dataToUpdate.type =
        dataToUpdate.subtype === "creditcard" || dataToUpdate.subtype === "loan"
          ? "liability"
          : "asset";
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { data: updatedAccount, error } = await supabase
      .from("account")
      .update(dataToUpdate)
      .eq("id", accountId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error updating account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, account: updatedAccount });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { success: false, error: "Error updating account" },
      { status: 500 }
    );
  }
}
