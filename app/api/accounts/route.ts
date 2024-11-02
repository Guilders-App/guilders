import { Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { AccountInsert } from "@/lib/supabase/types";
import { getJwt } from "@/lib/utils";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     tags:
 *      - Accounts
 *     summary: Create a new account
 *     description: Create a new account for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               subtype:
 *                 type: string
 *               value:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: Successfully created account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 account:
 *                   $ref: '#/components/schemas/Account'
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const jwt = getJwt(request);

    const { name, subtype, value, currency }: AccountInsert =
      await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser(jwt);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { data: newAccount, error } = await supabase
      .from("account")
      .insert({
        name,
        subtype,
        value,
        currency,
        type:
          subtype === "creditcard" || subtype === "loan"
            ? "liability"
            : "asset",
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error adding account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, account: newAccount });
  } catch (error) {
    console.error("Error adding account:", error);
    return NextResponse.json(
      { success: false, error: "Error adding account" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: Get all accounts for the user
 *     description: Get all accounts for the authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accounts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Account'
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

    // Fetch all accounts for the user
    const { data: accounts, error } = await supabase
      .from("account")
      .select("*")
      .eq("user_id", user.id)
      .returns<Tables<"account">[]>();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching accounts" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, accounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching accounts" },
      { status: 500 }
    );
  }
}
