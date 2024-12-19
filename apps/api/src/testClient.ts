import { treaty } from "@elysiajs/eden";
import type { ElysiaApp } from "./app";

const client = treaty<ElysiaApp>("http://localhost:3002");

const response = await client.currencies.index.get();

if (response.error) {
  console.error(response.error);
} else {
  console.log(response.data);
}
