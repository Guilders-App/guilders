declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase (database)
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      // Cron (cron jobs)
      CRON_SECRET: string;
      // AI (Advisor)
      ANTHROPIC_API_KEY: string;
      // Resend (email)
      RESEND_API_KEY: string;
      // Synth (financial data)
      SYNTH_API_KEY: string;
      // Snaptrade (brokerage provider)
      SNAPTRADE_CLIENT_ID: string;
      SNAPTRADE_CLIENT_SECRET: string;
      SNAPTRADE_WEBHOOK_SECRET: string;
      // GoCardless (banking provider)
      GOCARDLESS_CLIENT_ID: string;
      GOCARDLESS_CLIENT_SECRET: string;
      // SaltEdge (banking provider)
      SALTEDGE_CLIENT_ID: string;
      SALTEDGE_CLIENT_SECRET: string;
      SALTEDGE_PRIVATE_KEY: string;
      SALTEDGE_PUBLIC_KEY: string;
      SALTEDGE_CALLBACK_USERNAME: string;
      SALTEDGE_CALLBACK_PASSWORD: string;
      // Tink (banking provider)
      TINK_CLIENT_ID: string;
      TINK_CLIENT_SECRET: string;
    }
  }
}

export {};
