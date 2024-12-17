alter table "public"."account" add column "account_id" text;

alter table "public"."account" alter column "currency" set data type text using "currency"::text;

alter table "public"."account" alter column "name" set data type text using "name"::text;

alter table "public"."account" alter column "ticker" set data type text using "ticker"::text;

alter table "public"."currency" alter column "country" set data type text using "country"::text;

alter table "public"."institution" alter column "name" set data type text using "name"::text;

alter table "public"."institution" alter column "provider_institution_id" set data type text using "provider_institution_id"::text;

alter table "public"."institution_connection" alter column "connection_id" set data type text using "connection_id"::text;

alter table "public"."provider" alter column "logo_url" set data type text using "logo_url"::text;

alter table "public"."provider" alter column "name" set data type text using "name"::text;

alter table "public"."provider_connection" alter column "secret" set data type text using "secret"::text;

CREATE UNIQUE INDEX unique_provider_institution ON public.institution USING btree (provider_id, provider_institution_id);

alter table "public"."institution" add constraint "unique_provider_institution" UNIQUE using index "unique_provider_institution";


