import { Tables } from "@/lib/db/database.types";
import { createClient } from "@/lib/db/server";
import { TransactionInsert } from "@/lib/db/types";
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
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    let query = supabase
      .from("transaction")
      .select(`*, account:account_id(user_id)`)
      .eq("account.user_id", user.id);

    // Add account filter if accountId is provided
    if (accountId) {
      query = query.eq("account_id", accountId);
    }

    const { data: transactions, error } = await query
      .order("date", { ascending: false })
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

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Create a new transaction
 *     description: Create a new transaction for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransactionInsert'
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully created transaction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transaction:
 *                   $ref: '#/components/schemas/Transaction'
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const jwt = getJwt(request);
    const transactionData: TransactionInsert = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify the account belongs to the user
    const { data: account, error: accountError } = await supabase
      .from("account")
      .select("id, value")
      .eq("id", transactionData.account_id)
      .eq("user_id", user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: "Invalid account" },
        { status: 403 }
      );
    }

    // Create the transaction
    const { data: transaction, error } = await supabase
      .from("transaction")
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error creating transaction" },
        { status: 500 }
      );
    }

    // Update the account value
    const { error: updateError } = await supabase
      .from("account")
      .update({
        value: account.value + transaction.amount,
      })
      .eq("id", transaction.account_id);

    if (updateError) {
      console.error("Error updating account balance:", updateError);
      // Rollback the transaction since we couldn't update the balance
      await supabase.from("transaction").delete().eq("id", transaction.id);

      return NextResponse.json(
        { success: false, error: "Error updating account balance" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { success: false, error: "Error creating transaction" },
      { status: 500 }
    );
  }
}
