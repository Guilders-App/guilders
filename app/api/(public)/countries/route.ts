import { Tables } from "@/lib/db/database.types";
import { createClient } from "@/lib/db/server";
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
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully fetched countries
 */
export async function GET(_: Request) {
  try {
    const supabase = await createClient();
    const { data: countries, error } = await supabase.from("country").select();

    if (error) {
      return NextResponse.json(
        { success: false, error: "Error fetching countries" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      countries: countries as Tables<"country">[],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error fetching countries" },
      { status: 500 }
    );
  }
}
