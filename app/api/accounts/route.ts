import { createClient } from "@/lib/db/server";
import { Account, AccountInsert } from "@/lib/db/types";
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
    const { name, subtype, value, currency }: AccountInsert =
      await request.json();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const type =
      subtype === "creditcard" || subtype === "loan" ? "liability" : "asset";

    const { data: newAccount, error } = await supabase
      .from("account")
      .insert({
        name,
        subtype,
        value: type === "liability" && value >= 0 ? -value : value,
        currency,
        type,
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const { data: allAccounts, error } = await supabase
      .from("account")
      .select(
        `
        *,
        institution_connection (
          broken,
          institution (
            name,
            logo_url
          )
        )
      `
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching accounts" },
        { status: 500 }
      );
    }

    const accountsMap = new Map<number, Account>();
    allAccounts.forEach((account) => {
      accountsMap.set(account.id, {
        ...account,
        children: [],
        institution_connection: account.institution_connection?.institution
          ? {
              broken: account.institution_connection.broken,
              institution: {
                name: account.institution_connection.institution.name,
                logo_url: account.institution_connection.institution.logo_url,
              },
            }
          : null,
      });
    });

    const topLevelAccounts: Account[] = [];
    allAccounts.forEach((account) => {
      if (account.parent) {
        const parentAccount = accountsMap.get(account.parent);
        if (parentAccount) {
          parentAccount.children.push(accountsMap.get(account.id)!);
        }
      } else {
        topLevelAccounts.push(accountsMap.get(account.id)!);
      }
    });

    return NextResponse.json({ success: true, accounts: topLevelAccounts });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching accounts" },
      { status: 500 }
    );
  }
}
