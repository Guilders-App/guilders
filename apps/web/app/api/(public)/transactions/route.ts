import { authenticate } from "@/apps/web/lib/api/auth";
import { Tables } from "@/apps/web/lib/db/database.types";
import { TransactionInsert } from "@/apps/web/lib/db/types";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get all transactions for the user
 *     description: Get all transactions for the authenticated user
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
  const { client, userId, error } = await authenticate(request);
  if (error || !client || !userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get("accountId");

  let query = client
    .from("transaction")
    .select(`*, account:account_id(user_id)`)
    .eq("account.user_id", userId);

  if (accountId) {
    query = query.eq("account_id", accountId);
  }

  const { data: transactions, error: dbError } = await query
    .order("date", { ascending: false })
    .returns<Tables<"transaction">[]>();

  if (dbError) {
    return NextResponse.json(
      { success: false, error: "Error fetching transactions" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, transactions });
}

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Create a new transaction
 *     description: Create a new transaction for the authenticated user
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
    const { client, userId, error } = await authenticate(request);
    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const transactionData: TransactionInsert = await request.json();

    // Verify the account belongs to the user
    const { data: account, error: accountError } = await client
      .from("account")
      .select("id, value")
      .eq("id", transactionData.account_id)
      .eq("user_id", userId)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        { success: false, error: "Invalid account" },
        { status: 403 }
      );
    }

    // Create the transaction
    const { data: transaction, error: dbError } = await client
      .from("transaction")
      .insert(transactionData)
      .select()
      .single();

    if (dbError) {
      console.error("Supabase error:", dbError);
      return NextResponse.json(
        { success: false, error: "Error creating transaction" },
        { status: 500 }
      );
    }

    // Update the account value
    const { error: updateError } = await client
      .from("account")
      .update({
        value: account.value + transaction.amount,
      })
      .eq("id", transaction.account_id);

    if (updateError) {
      console.error("Error updating account balance:", updateError);
      // Rollback the transaction since we couldn't update the balance
      await client.from("transaction").delete().eq("id", transaction.id);

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
