import { Database } from "@/lib/db/database.types";
import { Account as SaltEdgeAccount } from "@/lib/providers/saltedge/types";

export const NATURE_TO_TYPE_SUBTYPE: Record<
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
