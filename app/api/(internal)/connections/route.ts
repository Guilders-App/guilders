import { createClient } from "@/lib/db/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/connections:
 *   get:
 *     tags:
 *       - Connections
 *     summary: Get all connections for the user
 *     description: |
 *       Get all connections for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully retrieved connections
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json(
      { success: false, error: userError.message },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("provider_connection")
    .select(
      `
      *,
      provider:provider_id (
        name,
        logo_url
      )
    `
    )
    .eq("user_id", userData.user.id);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
