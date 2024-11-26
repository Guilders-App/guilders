import { appRouter } from "@/lib/trpc/routers/_app";
import { createContext } from "@/lib/trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () =>
      createContext({
        req,
        resHeaders: new Headers(),
      }),
  });

export { handler as GET, handler as POST };
