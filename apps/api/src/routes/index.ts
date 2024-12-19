import Elysia from "elysia";
import { currenciesRoute } from "./currencies";

const route = new Elysia().use(currenciesRoute);

export { route as index };
