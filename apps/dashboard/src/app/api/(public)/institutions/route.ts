import { authenticate } from "@/lib/api/auth";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/institutions:
 *   get:
 *     tags:
 *      - Institutions
 *     summary: Get all institutions
 *     description: Get all institutions
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched institutions
 */
export async function GET(request: Request) {
  try {
    const { client, userId, error } = await authenticate(request);

    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    let { data, error: dbError } = await client.from("institution").select("*");

    if (dbError || !data) {
      return NextResponse.json(
        {
          success: false,
          error: dbError?.message || "Error fetching institutions",
        },
        { status: 500 },
      );
    }

    if (process.env.NODE_ENV === "production") {
      data = data.filter(
        (institution) => !institution.demo && institution.enabled,
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error fetching institutions" },
      { status: 500 },
    );
  }
}
