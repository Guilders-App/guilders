alter table "public"."subscription" drop constraint "unique_user_stripe_customer";

drop index if exists "public"."unique_user_stripe_customer";

CREATE UNIQUE INDEX unique_user ON public.subscription USING btree (user_id);

alter table "public"."subscription" add constraint "unique_user" UNIQUE using index "unique_user";


