import type { AppType } from "@/app";
import { hc } from "hono/client";

const client = hc<AppType>("http://localhost:3003/");

async function testClient() {
  const response = await client.currencies.$get();

  const { data, error } = await response.json();

  if (error || !data) {
    console.error(error);
  } else {
    console.log(data);
  }
}

testClient().catch(console.error);
