alter table "public"."account" drop constraint "account_connection_id_fkey";

alter table "public"."currency" drop constraint "currencies_pkey";

alter table "public"."provider_connection" drop constraint "connection_pkey";

drop index if exists "public"."connection_pkey";

drop index if exists "public"."currencies_pkey";

alter table "public"."currency" drop column "id";

alter table "public"."provider_connection" drop column "id";

alter table "public"."provider_connection" alter column "secret" drop not null;

CREATE UNIQUE INDEX currency_code_pkey ON public.currency USING btree (code);

CREATE UNIQUE INDEX provider_connection_pkey ON public.provider_connection USING btree (user_id, provider_id);

alter table "public"."currency" add constraint "currency_code_pkey" PRIMARY KEY using index "currency_code_pkey";

alter table "public"."provider_connection" add constraint "provider_connection_pkey" PRIMARY KEY using index "provider_connection_pkey";


