import { authenticate } from "@/apps/web/lib/api/auth";
import { Tables } from "@/apps/web/lib/db/database.types";
import { createClient } from "@/apps/web/lib/db/server";
import { Account, AccountInsert } from "@/apps/web/lib/db/types";
import { NextResponse } from "next/server";

type AccountWithConnections = Tables<"account"> & {
  institution_connection: {
    broken: boolean;
    institution: {
      name: string;
      logo_url: string;
      provider: {
        id: number;
        name: string;
      } | null;
    } | null;
  } | null;
};

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     tags:
 *      - Accounts
 *     summary: Create a new account
 *     description: Create a new account for the authenticated user
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
    const { client, userId, error } = await authenticate(request);
    if (error || !client || !userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: allAccounts, error: dbError } = await client
      .from("account")
      .select(
        `
        *,
        institution_connection (
          broken,
          institution (
            name,
            logo_url,
            provider (
              id,
              name
            )
          )
        )
      `
      )
      .eq("user_id", userId);

    if (dbError) {
      return NextResponse.json(
        { success: false, error: "Error fetching accounts" },
        { status: 500 }
      );
    }

    const accountsMap = new Map<number, Account>();
    (allAccounts as AccountWithConnections[]).forEach(
      (account: AccountWithConnections) => {
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
                provider: account.institution_connection.institution.provider
                  ? {
                      id: account.institution_connection.institution.provider
                        .id,
                      name: account.institution_connection.institution.provider
                        .name,
                    }
                  : undefined,
              }
            : null,
        });
      }
    );

    const topLevelAccounts: Account[] = [];
    (allAccounts as AccountWithConnections[]).forEach(
      (account: AccountWithConnections) => {
        if (account.parent) {
          const parentAccount = accountsMap.get(account.parent);
          if (parentAccount) {
            parentAccount.children.push(accountsMap.get(account.id)!);
          }
        } else {
          topLevelAccounts.push(accountsMap.get(account.id)!);
        }
      }
    );

    return NextResponse.json({ success: true, accounts: topLevelAccounts });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error fetching accounts" },
      { status: 500 }
    );
  }
}
