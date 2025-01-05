import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // Supabase (database)
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // Currency Beacon
    CURRENCY_BEACON_API_KEY: z.string().min(1),

    // Cron
    CRON_SECRET: z.string().min(1),

    // SnapTrade
    SNAPTRADE_CLIENT_ID: z.string().min(1),
    SNAPTRADE_CLIENT_SECRET: z.string().min(1),
    SNAPTRADE_WEBHOOK_SECRET: z.string().min(1),
  },
  runtimeEnv: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CURRENCY_BEACON_API_KEY: process.env.CURRENCY_BEACON_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    SNAPTRADE_CLIENT_ID: process.env.SNAPTRADE_CLIENT_ID,
    SNAPTRADE_CLIENT_SECRET: process.env.SNAPTRADE_CLIENT_SECRET,
    SNAPTRADE_WEBHOOK_SECRET: process.env.SNAPTRADE_WEBHOOK_SECRET,
  },
});
