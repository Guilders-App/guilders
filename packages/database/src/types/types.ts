import type { Enums, Tables, TablesInsert, TablesUpdate } from "./db";

export type Category = {
  name: Enums<"account_subtype">;
  value: number;
};

export type Institution = Tables<"institution">;
export type Provider = Tables<"provider">;
export type Account = Tables<"account"> & {
  children: Account[];
  institution_connection: {
    broken: boolean;
    institution: { name: string; logo_url: string };
    provider?: {
      id: number;
      name: string;
    };
  } | null;
};

export type AccountInsert = Omit<
  TablesInsert<"account">,
  "type" | "user_id" | "created_at" | "updated_at" | "connection_id"
>;
export type AccountUpdate = Omit<
  TablesUpdate<"account">,
  "type" | "user_id" | "created_at" | "updated_at" | "connection_id"
>;
export type AccountSubtype = Enums<"account_subtype">;

// TODO: Should we fetch this from the database?
export const accountSubtypes = [
  "depository",
  "brokerage",
  "crypto",
  "property",
  "vehicle",
  "creditcard",
  "loan",
  "stock",
] as const;

export const accountSubtypeLabels: Record<AccountSubtype, string> = {
  depository: "Depository",
  brokerage: "Brokerage",
  crypto: "Crypto",
  property: "Property",
  vehicle: "Vehicle",
  creditcard: "Credit Card",
  loan: "Loan",
  stock: "Stock",
};

export const colorMap: Record<AccountSubtype, string> = {
  depository: "#3e84f7",
  brokerage: "#82d0fa",
  crypto: "#83d1ce",
  property: "#b263ea",
  vehicle: "#5f5fde",
  loan: "#eb4b63",
  creditcard: "#FF9F45",
  stock: "#83d1ce",
};

export const getCategoryColor = (categoryName: AccountSubtype): string => {
  return colorMap[categoryName] || "#808080"; // Default to gray if category not found
};

export const getCategoryDisplayName = (
  categoryName: AccountSubtype,
): string => {
  return accountSubtypeLabels[categoryName] || categoryName;
};

export type Transaction = Tables<"transaction">;
export type TransactionInsert = Omit<
  TablesInsert<"transaction">,
  "provider_transaction_id"
>;
export type TransactionUpdate = Omit<
  TablesUpdate<"transaction">,
  "provider_transaction_id"
>;

export type Rate = {
  currency_code: string;
  rate: number;
};
