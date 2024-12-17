import { authenticate } from "@/lib/api/auth";
import { createClient } from "@guilders/database/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { client, userId, error } = await authenticate(request);
    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const filePath = `${userId}/accounts/${id}/${file.name}`;

    const { data, error: uploadError } = await supabase.storage
      .from("user_files")
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 },
      );
    }

    const { data: account, error: accountError } = await supabase
      .from("account")
      .select("documents")
      .eq("id", id)
      .single();

    if (accountError) {
      return NextResponse.json(
        { success: false, error: accountError.message },
        { status: 500 },
      );
    }

    const { error: updateError } = await supabase
      .from("account")
      .update({
        documents: [...(account.documents || []), filePath],
      })
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      await supabase.storage.from("user_files").remove([filePath]);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 },
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
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { client, userId, error } = await authenticate(request);
    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { path } = await request.json();
    if (!path) {
      return NextResponse.json(
        { success: false, error: "No file path provided" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // First get the current documents array
    const { data: account, error: accountError } = await supabase
      .from("account")
      .select("documents")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (accountError) {
      return NextResponse.json(
        { success: false, error: accountError.message },
        { status: 500 },
      );
    }

    // Filter out the document to be deleted
    const updatedDocuments = (account.documents || []).filter(
      (doc: string) => doc !== path,
    );

    // Update the account with the new documents array
    const { error: updateError } = await supabase
      .from("account")
      .update({ documents: updatedDocuments })
      .eq("id", id)
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 },
      );
    }

    // Delete the file from storage
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
      { status: 500 },
    );
  }
}
