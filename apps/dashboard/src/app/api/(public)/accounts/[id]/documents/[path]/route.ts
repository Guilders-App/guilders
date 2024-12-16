import { authenticate } from "@/apps/web/lib/api/auth";
import { createClient } from "@/apps/web/lib/db/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params;
  try {
    const { client, userId, error } = await authenticate(request);
    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { data, error: signedUrlError } = await supabase.storage
      .from("user_files")
      .createSignedUrl(path, 1800); // 30 minutes

    if (signedUrlError) {
      return NextResponse.json(
        { success: false, error: signedUrlError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: data.signedUrl });
  } catch (err) {
    console.error("Error getting signed URL:", err);
    return NextResponse.json(
      { success: false, error: "Failed to get signed URL" },
      { status: 500 }
    );
  }
}
