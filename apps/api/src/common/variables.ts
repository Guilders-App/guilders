import type { Database } from "@guilders/database/types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type Stripe from "stripe";

export type Variables = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export type StripeVariables = {
  stripe: Stripe;
};
