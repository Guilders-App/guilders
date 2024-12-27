import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(["development", "production"]),
  },
  server: {
    // Supabase (database)
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    // Resend (email)
    RESEND_API_KEY: z.string().min(1),
    RESEND_WAITLIST_AUDIENCE_ID: z.string().min(1),
    // Cron (scheduled jobs)
    CRON_SECRET: z.string().min(1),
    // AI
    ANTHROPIC_API_KEY: z.string().min(1),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
    // SnapTrade (brokerage)
    SNAPTRADE_CLIENT_ID: z.string().min(1),
    SNAPTRADE_CLIENT_SECRET: z.string().min(1),
    SNAPTRADE_WEBHOOK_SECRET: z.string().min(1),
    // SALTEDGE (banking)
    SALTEDGE_CLIENT_ID: z.string().min(1),
    SALTEDGE_CLIENT_SECRET: z.string().min(1),
    SALTEDGE_PRIVATE_KEY: z.string().min(1),
    SALTEDGE_PUBLIC_KEY: z.string().min(1),
    SALTEDGE_CALLBACK_USERNAME: z.string().min(1),
    SALTEDGE_CALLBACK_PASSWORD: z.string().min(1),
    SALTEDGE_CALLBACK_SIGNATURE: z.string().min(1),
    // Stripe (payments)
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    STRIPE_PRICE_ID: z.string().min(1),
  },
  client: {
    // Supabase (database)
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    // Stripe (payments)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    // Umami (analytics)
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().min(1),
    // Other
    NEXT_PUBLIC_WEBSITE_URL: z.string().url(),
    NEXT_PUBLIC_DASHBOARD_URL: z.string().url(),
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    // Shared
    NODE_ENV: process.env.NODE_ENV,
    // Server
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_WAITLIST_AUDIENCE_ID: process.env.RESEND_WAITLIST_AUDIENCE_ID,
    CRON_SECRET: process.env.CRON_SECRET,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    SNAPTRADE_CLIENT_ID: process.env.SNAPTRADE_CLIENT_ID,
    SNAPTRADE_CLIENT_SECRET: process.env.SNAPTRADE_CLIENT_SECRET,
    SNAPTRADE_WEBHOOK_SECRET: process.env.SNAPTRADE_WEBHOOK_SECRET,
    SALTEDGE_CLIENT_ID: process.env.SALTEDGE_CLIENT_ID,
    SALTEDGE_CLIENT_SECRET: process.env.SALTEDGE_CLIENT_SECRET,
    SALTEDGE_PRIVATE_KEY: process.env.SALTEDGE_PRIVATE_KEY,
    SALTEDGE_PUBLIC_KEY: process.env.SALTEDGE_PUBLIC_KEY,
    SALTEDGE_CALLBACK_USERNAME: process.env.SALTEDGE_CALLBACK_USERNAME,
    SALTEDGE_CALLBACK_PASSWORD: process.env.SALTEDGE_CALLBACK_PASSWORD,
    SALTEDGE_CALLBACK_SIGNATURE: process.env.SALTEDGE_CALLBACK_SIGNATURE,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
    // Client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
    NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
});
