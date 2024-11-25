import { createClient } from "@/lib/db/server";
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
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched institutions
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
 *                     $ref: '#/components/schemas/Institution'
 */
export async function GET(_: Request) {
  const supabase = await createClient();
  let { data, error } = await supabase.from("institution").select("*");

  if (error || !data) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Error fetching institutions",
      },
      { status: 500 }
    );
  }

  if (process.env.NODE_ENV === "production") {
    data = data.filter((institution) => !institution.demo);
  }

  return NextResponse.json({ success: true, data });
}
