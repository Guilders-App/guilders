drop policy "Enable read access for all users" on "public"."rates";

revoke delete on table "public"."rates" from "anon";

revoke insert on table "public"."rates" from "anon";

revoke references on table "public"."rates" from "anon";

revoke select on table "public"."rates" from "anon";

revoke trigger on table "public"."rates" from "anon";

revoke truncate on table "public"."rates" from "anon";

revoke update on table "public"."rates" from "anon";

revoke delete on table "public"."rates" from "authenticated";

revoke insert on table "public"."rates" from "authenticated";

revoke references on table "public"."rates" from "authenticated";

revoke select on table "public"."rates" from "authenticated";

revoke trigger on table "public"."rates" from "authenticated";

revoke truncate on table "public"."rates" from "authenticated";

revoke update on table "public"."rates" from "authenticated";

revoke delete on table "public"."rates" from "service_role";

revoke insert on table "public"."rates" from "service_role";

revoke references on table "public"."rates" from "service_role";

revoke select on table "public"."rates" from "service_role";

revoke trigger on table "public"."rates" from "service_role";

revoke truncate on table "public"."rates" from "service_role";

revoke update on table "public"."rates" from "service_role";

alter table "public"."rates" drop constraint "rates_currency_fkey";

alter table "public"."rates" drop constraint "rates_pkey";

drop index if exists "public"."idx_rates_currency_code";

drop index if exists "public"."rates_pkey";

drop table "public"."rates";

create table "public"."rate" (
    "currency_code" text not null,
    "rate" double precision not null
);


alter table "public"."rate" enable row level security;

CREATE INDEX idx_rates_currency_code ON public.rate USING btree (currency_code);

CREATE UNIQUE INDEX rates_pkey ON public.rate USING btree (currency_code);

alter table "public"."rate" add constraint "rates_pkey" PRIMARY KEY using index "rates_pkey";

alter table "public"."rate" add constraint "rates_currency_fkey" FOREIGN KEY (currency_code) REFERENCES currency(code) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."rate" validate constraint "rates_currency_fkey";

grant delete on table "public"."rate" to "anon";

grant insert on table "public"."rate" to "anon";

grant references on table "public"."rate" to "anon";

grant select on table "public"."rate" to "anon";

grant trigger on table "public"."rate" to "anon";

grant truncate on table "public"."rate" to "anon";

grant update on table "public"."rate" to "anon";

grant delete on table "public"."rate" to "authenticated";

grant insert on table "public"."rate" to "authenticated";

grant references on table "public"."rate" to "authenticated";

grant select on table "public"."rate" to "authenticated";

grant trigger on table "public"."rate" to "authenticated";

grant truncate on table "public"."rate" to "authenticated";

grant update on table "public"."rate" to "authenticated";

grant delete on table "public"."rate" to "service_role";

grant insert on table "public"."rate" to "service_role";

grant references on table "public"."rate" to "service_role";

grant select on table "public"."rate" to "service_role";

grant trigger on table "public"."rate" to "service_role";

grant truncate on table "public"."rate" to "service_role";

grant update on table "public"."rate" to "service_role";

create policy "Enable read access for all users"
on "public"."rate"
as permissive
for select
to public
using (true);



