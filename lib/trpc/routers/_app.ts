import { router } from "../server";
import { accountRouter } from "./account";
// import { transactionRouter } from "./transaction";
// Import other routers

export const appRouter = router({
  account: accountRouter,
  // transaction: transactionRouter,
  // Add other routers
});

export type AppRouter = typeof appRouter;
