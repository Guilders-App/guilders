declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase (database)
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      // Posthog (analytics)
      NEXT_PUBLIC_POSTHOG_KEY: string;
      NEXT_PUBLIC_POSTHOG_HOST: string;
      // Resend (email)
      RESEND_API_KEY: string;
      // Cron (cron jobs)
      CRON_SECRET: string;
      // AI (Advisor)
      ANTHROPIC_API_KEY: string;
      // Ngrok (local development)
      NGROK_AUTH_TOKEN: string;
      NGROK_URL: string;
      // Snaptrade (brokerage provider)
      SNAPTRADE_CLIENT_ID: string;
      SNAPTRADE_CLIENT_SECRET: string;
      SNAPTRADE_WEBHOOK_SECRET: string;
      // SaltEdge (banking provider)
      SALTEDGE_CLIENT_ID: string;
      SALTEDGE_CLIENT_SECRET: string;
      SALTEDGE_PRIVATE_KEY: string;
      SALTEDGE_PUBLIC_KEY: string;
      SALTEDGE_CALLBACK_USERNAME: string;
      SALTEDGE_CALLBACK_PASSWORD: string;
      // Other
      NEXT_PUBLIC_CAL_URL: string;
    }
  }
}

export {};
