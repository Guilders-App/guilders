import { createClient } from "@/apps/web/lib/db/server";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/institution-connections/{id}:
 *   get:
 *     tags:
 *       - Institution Connections
 *     summary: Get an institution connection by ID
 *     description: Get an institution connection by ID for the authenticated user
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched institution connection
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("institution_connection")
      .select(
        `
        *,
        provider_connection!inner (
          user_id
        )
      `
      )
      .eq("id", id)
      .eq("provider_connection.user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching institution connection:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching institution connection" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching institution connection:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching institution connection" },
      { status: 500 }
    );
  }
}
