import { createClient } from "@/lib/db/server";
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
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched providers
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
 *                     $ref: '#/components/schemas/Provider'
 */
export async function GET(_: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("provider").select("*");
  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, data });
}
