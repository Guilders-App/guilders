import { getRates } from "@/lib/db/utils";
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
  const rates = await getRates();

  return NextResponse.json({
    success: true,
    base: "EUR",
    data: rates,
  });
}
