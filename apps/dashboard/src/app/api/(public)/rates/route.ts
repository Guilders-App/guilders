import { authenticate } from "@/lib/api/auth";
import { getRates } from "@/lib/db/utils";
import { type NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/rates:
 *   get:
 *     tags:
 *      - Rates
 *     summary: Get currency rates
 *     description: Get currency rates, updated daily
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched rates
 */
export async function GET(request: NextRequest) {
  try {
    const { client, userId, error } = await authenticate(request);

    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const rates = await getRates();

    return NextResponse.json({
      success: true,
      base: "EUR",
      data: rates,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error fetching rates" },
      { status: 500 },
    );
  }
}
