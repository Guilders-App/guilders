import { Tables } from "@/lib/db/database.types";
import { createClient } from "@/lib/db/server";
import { getJwt } from "@/lib/utils";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get all transactions for the user
 *     description: Get all transactions for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const jwt = getJwt(request);
    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { data: transactions, error } = await supabase
      .from("transaction")
      .select(`*, account:account_id(user_id)`)
      .eq("account.user_id", user.id)
      .returns<Tables<"transaction">[]>();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching transactions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching transactions" },
      { status: 500 }
    );
  }
}
