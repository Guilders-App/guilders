import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    RESEND_API_KEY: z.string(),
    RESEND_WAITLIST_AUDIENCE_ID: z.string(),
  },
  client: {
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string(),
    NEXT_PUBLIC_CAL_URL: z.string(),
    NEXT_PUBLIC_DASHBOARD_URL: z.string(),
  },
  runtimeEnv: {
    // Server
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_WAITLIST_AUDIENCE_ID: process.env.RESEND_WAITLIST_AUDIENCE_ID,
    // Client
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    NEXT_PUBLIC_CAL_URL: process.env.NEXT_PUBLIC_CAL_URL,
    NEXT_PUBLIC_DASHBOARD_URL: process.env.NEXT_PUBLIC_DASHBOARD_URL,
  },
});
