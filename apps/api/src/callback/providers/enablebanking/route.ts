import type { Bindings } from "@/common/variables";
import { Hono } from "hono";

const app = new Hono<{ Bindings: Bindings }>().get("/", async (c) => {
  const query = await c.req.query();
  console.log(query);

  return c.json({
    message: "Hello World",
  });
});

export default app;
