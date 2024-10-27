import {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

export type Category = {
  name: Enums<"account_subtype">;
  value: number;
};

export type Account = Tables<"account">;
export type AccountInsert = Omit<
  TablesInsert<"account">,
  | "type"
  | "user_id"
  | "exchange_rate"
  | "created_at"
  | "updated_at"
  | "connection_id"
>;
export type AccountUpdate = Omit<
  TablesUpdate<"account">,
  | "type"
  | "user_id"
  | "exchange_rate"
  | "created_at"
  | "updated_at"
  | "connection_id"
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
] as const;

export const accountSubtypeLabels: Record<AccountSubtype, string> = {
  depository: "Depository",
  brokerage: "Brokerage",
  crypto: "Crypto",
  property: "Property",
  vehicle: "Vehicle",
  creditcard: "Credit Card",
  loan: "Loan",
};

export const colorMap: Record<AccountSubtype, string> = {
  depository: "#3e84f7",
  brokerage: "#82d0fa",
  crypto: "#83d1ce",
  property: "#b263ea",
  vehicle: "#5f5fde",
  loan: "#eb4b63",
  creditcard: "#FF9F45",
};

export const getCategoryColor = (categoryName: AccountSubtype): string => {
  return colorMap[categoryName] || "#808080"; // Default to gray if category not found
};

export const getCategoryDisplayName = (
  categoryName: AccountSubtype
): string => {
  return accountSubtypeLabels[categoryName] || categoryName;
};
