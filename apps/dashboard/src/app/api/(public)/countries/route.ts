import { authenticate } from "@/lib/api/auth";
import type { Tables } from "@guilders/database/types";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/countries:
 *   get:
 *     tags:
 *       - Countries
 *     summary: Get all countries
 *     description: Get all supported countries.
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched countries
 */
export async function GET(request: Request) {
  const { client, userId, error } = await authenticate(request);
  if (error || !client || !userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 },
    );
  }

  const { data: countries, error: dbError } = await client
    .from("country")
    .select();

  if (dbError) {
    return NextResponse.json(
      { success: false, error: "Error fetching countries" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    countries: countries as Tables<"country">[],
  });
}
