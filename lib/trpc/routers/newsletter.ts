import { resend } from "@/lib/resend";
import { z } from "zod";
import { publicProcedure, router } from "../server";

export const newsletterRouter = router({
  subscribe: publicProcedure
    .input(z.string().email("Invalid email address"))
    .mutation(async ({ input: email }) => {
      if (!process.env.RESEND_WAITLIST_AUDIENCE_ID) {
        throw new Error("Missing RESEND_WAITLIST_AUDIENCE_ID");
      }

      const { error } = await resend.contacts.create({
        email,
        audienceId: process.env.RESEND_WAITLIST_AUDIENCE_ID,
      });

      if (error) {
        throw error;
      }

      return {
        message: "You've been added to the waitlist.",
      };
    }),
});
