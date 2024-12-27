create table "public"."rates" (
    "currency_code" text not null,
    "rate" double precision not null
);


alter table "public"."rates" enable row level security;

alter table "public"."subscription" alter column "cancel_at" drop default;

alter table "public"."subscription" alter column "canceled_at" drop default;

alter table "public"."subscription" alter column "ended_at" drop default;

alter table "public"."subscription" alter column "trial_end" drop default;

alter table "public"."subscription" alter column "trial_start" drop default;

CREATE INDEX idx_rates_currency_code ON public.rates USING btree (currency_code);

CREATE UNIQUE INDEX rates_pkey ON public.rates USING btree (currency_code);

CREATE UNIQUE INDEX unique_user_stripe_customer ON public.subscription USING btree (user_id, stripe_customer_id);

alter table "public"."rates" add constraint "rates_pkey" PRIMARY KEY using index "rates_pkey";

alter table "public"."rates" add constraint "rates_currency_fkey" FOREIGN KEY (currency_code) REFERENCES currency(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."rates" validate constraint "rates_currency_fkey";

alter table "public"."subscription" add constraint "unique_user_stripe_customer" UNIQUE using index "unique_user_stripe_customer";

grant delete on table "public"."rates" to "anon";

grant insert on table "public"."rates" to "anon";

grant references on table "public"."rates" to "anon";

grant select on table "public"."rates" to "anon";

grant trigger on table "public"."rates" to "anon";

grant truncate on table "public"."rates" to "anon";

grant update on table "public"."rates" to "anon";

grant delete on table "public"."rates" to "authenticated";

grant insert on table "public"."rates" to "authenticated";

grant references on table "public"."rates" to "authenticated";

grant select on table "public"."rates" to "authenticated";

grant trigger on table "public"."rates" to "authenticated";

grant truncate on table "public"."rates" to "authenticated";

grant update on table "public"."rates" to "authenticated";

grant delete on table "public"."rates" to "service_role";

grant insert on table "public"."rates" to "service_role";

grant references on table "public"."rates" to "service_role";

grant select on table "public"."rates" to "service_role";

grant trigger on table "public"."rates" to "service_role";

grant truncate on table "public"."rates" to "service_role";

grant update on table "public"."rates" to "service_role";

create policy "Enable read access for all users"
on "public"."rates"
as permissive
for select
to public
using (true);



