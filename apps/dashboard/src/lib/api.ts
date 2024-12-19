import { env } from "@/env";
import { treaty } from "@elysiajs/eden";
import type { ElysiaApp } from "@guilders/api";

export const api = treaty<ElysiaApp>(env.NEXT_PUBLIC_API_URL);
