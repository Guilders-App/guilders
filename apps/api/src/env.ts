import type { Bindings } from "@/common/variables";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const getEnv = (env: Bindings) =>
  createEnv({
    server: {
      // Supabase (database)
      SUPABASE_URL: z.string().url(),
      SUPABASE_ANON_KEY: z.string().min(1),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

      // Currency Beacon
      CURRENCY_BEACON_API_KEY: z.string().min(1),

      // Stripe
      STRIPE_SECRET_KEY: z.string().min(1),
      STRIPE_PRICE_ID: z.string().min(1),
      STRIPE_WEBHOOK_SECRET: z.string().min(1),

      // SnapTrade
      SNAPTRADE_CLIENT_ID: z.string().min(1),
      SNAPTRADE_CLIENT_SECRET: z.string().min(1),
      SNAPTRADE_WEBHOOK_SECRET: z.string().min(1),
    },
    runtimeEnv: {
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
      CURRENCY_BEACON_API_KEY: env.CURRENCY_BEACON_API_KEY,
      STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
      STRIPE_PRICE_ID: env.STRIPE_PRICE_ID,
      STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
      SNAPTRADE_CLIENT_ID: env.SNAPTRADE_CLIENT_ID,
      SNAPTRADE_CLIENT_SECRET: env.SNAPTRADE_CLIENT_SECRET,
      SNAPTRADE_WEBHOOK_SECRET: env.SNAPTRADE_WEBHOOK_SECRET,
    },
    emptyStringAsUndefined: true,
  });
