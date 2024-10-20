import { Enums } from "./supabase/database.types";

export type Category = {
  name: Enums<"account_subtype">;
  value: number;
};
