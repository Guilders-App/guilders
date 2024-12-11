import { authenticate } from "@/lib/api/auth";
import { createClient } from "@/lib/db/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { client, userId, error } = await authenticate(request);
    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("Transaction ID", id);
    console.log("User ID", userId);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const filePath = `${userId}/transactions/${id}/${file.name}`;

    const { data, error: uploadError } = await supabase.storage
      .from("user_files")
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: transaction, error: transactionError } = await supabase
      .from("transaction")
      .select(
        `
        *,
        account:account_id (
          user_id
        )
      `
      )
      .eq("id", id)
      .eq("account.user_id", userId)
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("transaction")
      .update({
        documents: [...(transaction.documents || []), filePath],
      })
      .eq("id", id);

    if (updateError) {
      await supabase.storage.from("user_files").remove([filePath]);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      file: {
        id: data.path,
        name: file.name,
        size: file.size,
        url: filePath,
        type: file.type,
      },
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { client, userId, error } = await authenticate(request);
    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { path } = await request.json();
    if (!path) {
      return NextResponse.json(
        { success: false, error: "No file path provided" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: transaction, error: transactionError } = await supabase
      .from("transaction")
      .select(
        `
        *,
        account:account_id (
          user_id
        )
      `
      )
      .eq("id", id)
      .eq("account.user_id", userId)
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    const updatedDocuments = (transaction.documents || []).filter(
      (doc: string) => doc !== path
    );

    const { error: updateError } = await supabase
      .from("transaction")
      .update({ documents: updatedDocuments })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase.storage
      .from("user_files")
      .remove([path]);

    if (deleteError) {
      console.error("Error deleting file from storage:", deleteError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting file:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
