declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase (database)
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      // Resend (email)
      RESEND_API_KEY: string;
      // Snaptrade (brokerage provider)
      SNAPTRADE_CLIENT_ID: string;
      SNAPTRADE_CLIENT_SECRET: string;
    }
  }
}

export {};
