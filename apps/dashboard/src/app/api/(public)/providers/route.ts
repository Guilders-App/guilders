import { authenticate } from "@/lib/api/auth";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/providers:
 *   get:
 *     tags:
 *      - Providers
 *     summary: Get all providers
 *     description: Get all providers
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched providers
 */
export async function GET(request: Request) {
  const { client, userId, error } = await authenticate(request);
  if (error || !client || !userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );
  }

  const { data, error: dbError } = await client.from("provider").select("*");
  if (dbError) {
    return NextResponse.json(
      { success: false, error: dbError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, data });
}
