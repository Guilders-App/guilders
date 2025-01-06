import type { Bindings } from "@/common/variables";
import Stripe from "stripe";

export const getStripe = (env: Bindings) => new Stripe(env.STRIPE_SECRET_KEY);
