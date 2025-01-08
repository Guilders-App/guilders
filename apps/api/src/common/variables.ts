import type { Database } from "@guilders/database/types";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type Variables = {
  supabase: SupabaseClient<Database>;
  user: User;
};

export type Bindings = {
  // Common
  API_URL: string;

  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Currency Beacon
  CURRENCY_BEACON_API_KEY: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID: string;
  STRIPE_WEBHOOK_SECRET: string;

  // SnapTrade
  SNAPTRADE_CLIENT_ID: string;
  SNAPTRADE_CLIENT_SECRET: string;
  SNAPTRADE_WEBHOOK_SECRET: string;

  // EnableBanking
  ENABLEBANKING_CLIENT_ID: string;
  ENABLEBANKING_CLIENT_PRIVATE_KEY: string;
};
