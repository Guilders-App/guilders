import type { Enums } from "./db";

export type Category = {
  name: Enums<"account_subtype">;
  value: number;
};

export type AccountSubtype = Enums<"account_subtype">;

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
