import { createClient } from "@/lib/db/server";
import { getJwt } from "@/lib/utils";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/institution-connections:
 *   get:
 *     tags:
 *       - Institution Connections
 *     summary: Get all institution connections
 *     description: Get all institution connections for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched institution connections
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const jwt = getJwt(request);

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);
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
      .eq("provider_connection.user_id", user.id);

    if (error) {
      console.error("Error fetching institution connections:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching institution connections" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching institution connections:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching institution connections" },
      { status: 500 }
    );
  }
}
