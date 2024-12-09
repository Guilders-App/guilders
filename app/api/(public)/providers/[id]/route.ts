import { authenticate } from "@/lib/api/auth";
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
  request: Request,
  { params }: { params: { id: string } }
) {
  const { client, userId, error } = await authenticate(request);
  if (error || !client || !userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const { data, error: dbError } = await client
    .from("provider")
    .select("*")
    .eq("id", params.id)
    .single();

  if (dbError) {
    return NextResponse.json(
      { success: false, error: dbError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
