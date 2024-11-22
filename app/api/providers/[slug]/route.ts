import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
/**
 * @swagger
 * /api/providers/{id}:
 *   get:
 *     tags:
 *      - Providers
 *     summary: Get a provider by ID
 *     description: Retrieve a provider by their unique identifier
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
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from("provider")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, data });
}
