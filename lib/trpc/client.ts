import { CreateTRPCClientOptions, httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./routers/_app";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClientConfig: CreateTRPCClientOptions<AppRouter> = {
  links: [
    httpBatchLink({
      url: "/api",
    }),
  ],
};
