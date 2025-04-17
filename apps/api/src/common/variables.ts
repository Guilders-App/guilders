import type { KVNamespace } from "@cloudflare/workers-types";
import type { DatabaseClient, DatabaseUser } from "@guilders/database/types";

export type Variables = {
  supabase: DatabaseClient;
  user: DatabaseUser;
};

export type Bindings = {
  // Cloudflare
  KV: KVNamespace;
  ENRICH_KV: KVNamespace;

  // Common
  API_URL: string;
  ALLOW_PREMIUM_FEATURES: string;

  // AI
  ANTHROPIC_API_KEY: string;

  // Ntropy
  NTROPY_API_KEY: string;

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
