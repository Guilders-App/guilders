import { saltedge } from "@/lib/providers/saltedge/client";
import { Account as SaltEdgeAccount } from "@/lib/providers/saltedge/types";
import { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export type SaltEdgeCallbackBody = {
  data: {
    connection_id: string;
    customer_id: string;
    custom_fields: {
      institution_id: string;
      user_id: string;
    };
    stage:
      | "connect"
      | "start"
      | "fetch_accounts"
      | "fetch_transactions"
      | "finish_fetching"
      | "finish"
      | "error";
  };
  meta: {
    version: string;
    time: string;
  };
};

const NATURE_TO_TYPE_SUBTYPE: Record<
  SaltEdgeAccount["nature"],
  {
    type: Database["public"]["Enums"]["account_type"];
    subtype: Database["public"]["Enums"]["account_subtype"];
  }
> = {
  checking: { type: "asset", subtype: "depository" },
  savings: { type: "asset", subtype: "depository" },
  account: { type: "asset", subtype: "depository" },
  card: { type: "asset", subtype: "depository" },
  ewallet: { type: "asset", subtype: "depository" },

  investment: { type: "asset", subtype: "brokerage" },

  credit: { type: "liability", subtype: "loan" },
  loan: { type: "liability", subtype: "loan" },
  mortgage: { type: "liability", subtype: "loan" },

  credit_card: { type: "liability", subtype: "creditcard" },
  debit_card: { type: "asset", subtype: "depository" },

  bonus: { type: "asset", subtype: "depository" },
  insurance: { type: "asset", subtype: "depository" },
};

export async function POST(request: NextRequest) {
  console.log("SaltEdge callback received");
  const { data }: SaltEdgeCallbackBody = await request.json();
  console.log("Headers:");
  console.log(request.headers);
  console.log("Data:");
  console.log(data);

  if (data.stage !== "finish") {
    return NextResponse.json({ message: "Hello, World!" });
  }

  // const supabase = await createClient();

  // const { error } = await supabase.from("institution_connection").upsert({
  //   institution_id: institution.id,
  //   user_id: body.userId,
  //   connection_id: data.connection_id,
  // });

  // const { data: accounts } = await saltedge.getAccounts(
  //   data.customer_id,
  //   data.connection_id
  // );

  const supabase = await createClient();

  const { data: institutionConnection, error: institutionConnectionError } =
    await supabase
      .from("institution_connection")
      .upsert({
        institution_id: Number(data.custom_fields.institution_id),
        user_id: data.custom_fields.user_id,
        connection_id: data.connection_id,
      })
      .select()
      .single();

  if (institutionConnectionError) {
    console.error(
      "Error inserting institution connection:",
      institutionConnectionError
    );
    return NextResponse.json(
      { success: false, error: "Error inserting institution connection" },
      { status: 500 }
    );
  }

  const accounts = await saltedge.getAccounts(
    data.customer_id,
    data.connection_id
  );

  console.log("Accounts:");
  console.log(accounts);
  const { error: accountsError } = await supabase.from("account").upsert(
    accounts.map((account) => {
      const typeMapping = NATURE_TO_TYPE_SUBTYPE[account.nature];
      return {
        type: typeMapping.type,
        subtype: typeMapping.subtype,
        user_id: data.custom_fields.user_id,
        name: account.name,
        value: account.balance,
        currency: account.currency_code,
        institution_connection_id: institutionConnection.id,
        account_id: account.id,
      };
    }),
    { onConflict: "institution_connection_id,account_id" }
  );

  if (accountsError) {
    console.error("Error inserting accounts:", accountsError);
    return NextResponse.json(
      { success: false, error: "Error inserting accounts" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
