import { t } from "elysia";
import { createResponseSchema } from "../../types";

export const currencySchema = t.Object({
  code: t.String(),
  name: t.String(),
  country: t.String(),
});

export const currencyResponseSchema = createResponseSchema(currencySchema);
export const currenciesResponseSchema = createResponseSchema(
  t.Array(currencySchema),
);
