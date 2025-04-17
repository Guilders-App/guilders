import type { Bindings, Variables } from "@/common/variables";
import { TransactionSchema } from "@/routes/transactions/schema";
import { enrichTransactionTask } from "@/trigger/enrich";
import { configure } from "@trigger.dev/sdk/v3";
import { Hono } from "hono";
import { z } from "zod";

const EnrichmentCallbackSchema = z.object({
  type: z.string().toUpperCase(),
  table: z.string(),
  record: TransactionSchema,
  schema: z.string(),
  old_record: TransactionSchema.optional().nullable(),
});

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>().post(
  "/",
  async (c) => {
    const body = await c.req.json();
    const parsedBody = EnrichmentCallbackSchema.parse(body);

    configure({ secretKey: c.env.TRIGGER_SECRET_KEY });
    await enrichTransactionTask.trigger({
      transaction: parsedBody.record,
    });

    return c.json({ message: "Enrichment tasks queued" });
  },
);

export default app;
