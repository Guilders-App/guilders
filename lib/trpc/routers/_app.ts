import { router } from "../server";
import { accountRouter } from "./account";
import { chatRouter } from "./chat";
import { connectionRouter } from "./connection";
import { currencyRouter } from "./currency";
import { institutionRouter } from "./institution";
import { newsletterRouter } from "./newsletter";
import { providerRouter } from "./provider";
import { transactionRouter } from "./transaction";
import { userRouter } from "./user";

export const appRouter = router({
  account: accountRouter,
  chat: chatRouter,
  connection: connectionRouter,
  currency: currencyRouter,
  institution: institutionRouter,
  newsletter: newsletterRouter,
  provider: providerRouter,
  transaction: transactionRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
