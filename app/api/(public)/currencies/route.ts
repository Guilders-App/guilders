import { authenticate } from "@/lib/api/auth";
import { Tables } from "@/lib/db/database.types";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/currencies:
 *   get:
 *     tags:
 *       - Currencies
 *     summary: Get all currencies
 *     description: Get all supported currencies.
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched currencies
 */
export async function GET(request: Request) {
  const { client, userId, error } = await authenticate(request);
  if (error || !client || !userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const { data: currencies, error: dbError } = await client
    .from("currency")
    .select();

  if (dbError) {
    return NextResponse.json(
      { success: false, error: "Error fetching currencies" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    currencies: currencies as Tables<"currency">[],
  });
}
