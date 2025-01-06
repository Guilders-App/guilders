import type { AppType } from "@/app";
import { type ClientRequestOptions, hc } from "hono/client";

export const createApiClient = (opts?: ClientRequestOptions) => {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw Error("NEXT_PUBLIC_API_URL missing");
  }

  return hc<AppType>(process.env.NEXT_PUBLIC_API_URL, opts);
};
