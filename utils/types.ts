import { Enums } from "@/lib/supabase/database.types";

export type Category = {
  name: Enums<"account_subtype">;
  value: number;
};

export type Account = {
  name: string;
  value: number;
  cost: number;
};

export const accountSubtypes = [
  "depository",
  "brokerage",
  "crypto",
  "property",
  "vehicle",
  "creditcard",
  "loan",
] as const;

export type AccountSubtype = (typeof accountSubtypes)[number];

export const accountSubtypeLabels: Record<AccountSubtype, string> = {
  depository: "Depository",
  brokerage: "Brokerage",
  crypto: "Crypto",
  property: "Property",
  vehicle: "Vehicle",
  creditcard: "Credit Card",
  loan: "Loan",
};

export const currencies = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "JPY",
  "AUD",
  "CHF",
] as const;

export type Currency = (typeof currencies)[number];
