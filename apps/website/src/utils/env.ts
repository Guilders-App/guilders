declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Umami (analytics)
      NEXT_PUBLIC_UMAMI_WEBSITE_ID: string;
      // Resend (email)
      RESEND_API_KEY: string;
      RESEND_WAITLIST_AUDIENCE_ID: string;
      // Calendly (book a demo)
      NEXT_PUBLIC_CAL_URL: string;
    }
  }
}

export {};
