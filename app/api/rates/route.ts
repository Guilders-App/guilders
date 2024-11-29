import { saltedge } from "@/lib/providers/saltedge/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/rates:
 *   get:
 *     tags:
 *      - Rates
 *     summary: Get currency rates
 *     description: Get currency rates, updated daily
 *     responses:
 *       '200':
 *         description: Rates
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rate'
 */
export async function GET(_: NextRequest) {
  const rates = await saltedge.getRates();

  const sanitizedRates = rates.map(({ currency_code, rate }) => ({
    currency_code,
    rate,
  }));

  return NextResponse.json({
    success: true,
    base: "USD",
    data: sanitizedRates,
  });
}
