import { createClient } from "@guilders/database/server";
import type { Tables } from "@guilders/database/types";
import { NextResponse } from "next/server";
import type { ApiResponse } from "../../common";

type InstitutionConnection = Tables<"institution_connection"> & {
  provider_connection: Tables<"provider_connection">;
};

/**
 * @swagger
 * /api/institution-connections:
 *   get:
 *     tags:
 *       - Institution Connections
 *     summary: Get all institution connections
 *     description: Get all institution connections for the authenticated user
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched institution connections
 */
export async function GET(_: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 },
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
      `,
      )
      .eq("provider_connection.user_id", user.id);

    if (error) {
      console.error("Error fetching institution connections:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching institution connections" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: data as InstitutionConnection[],
    } satisfies ApiResponse<InstitutionConnection[]>);
  } catch (error) {
    console.error("Error fetching institution connections:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching institution connections" },
      { status: 500 },
    );
  }
}
