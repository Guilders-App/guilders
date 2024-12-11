import { authenticate } from "@/lib/api/auth";
import { createClient } from "@/lib/db/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { client, userId, error } = await authenticate(request);
    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const filePath = `${userId}/accounts/${params.id}/${file.name}`;

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

    const {
      data: { publicUrl },
    } = supabase.storage.from("user_files").getPublicUrl(filePath);

    const { data: account, error: accountError } = await supabase
      .from("account")
      .select("documents")
      .eq("id", params.id)
      .single();

    if (accountError) {
      return NextResponse.json(
        { success: false, error: accountError.message },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("account")
      .update({
        documents: [...(account.documents || []), filePath],
      })
      .eq("id", params.id)
      .eq("user_id", userId);

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
        url: publicUrl,
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
