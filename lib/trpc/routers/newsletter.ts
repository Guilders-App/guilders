import { z } from "zod";
import { publicProcedure, router } from "../server";

export const newsletterRouter = router({
  subscribe: publicProcedure
    .input(z.string().email())
    .mutation(async ({ ctx, input: email }) => {
      const response = await fetch("/api/other/newsletter", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(
          data.error.message || "Failed to subscribe to newsletter"
        );
      }
      return data;
    }),
});
