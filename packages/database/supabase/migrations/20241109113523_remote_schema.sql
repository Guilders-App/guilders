alter table "public"."account" drop constraint "account_account_id_fkey";

alter table "public"."account_connection" drop constraint "account_connection_pkey";

drop index if exists "public"."account_connection_pkey";

alter table "public"."account" drop column "account_id";

alter table "public"."account" add column "account_connection_id" character varying;

alter table "public"."account" add column "institution_connection_id" bigint;

alter table "public"."account_connection" drop column "id";

CREATE UNIQUE INDEX account_connection_pkey ON public.account_connection USING btree (institution_connection_id, account_id);

alter table "public"."account_connection" add constraint "account_connection_pkey" PRIMARY KEY using index "account_connection_pkey";

alter table "public"."account" add constraint "account_account_connection_id_institution_connection_id_fkey" FOREIGN KEY (account_connection_id, institution_connection_id) REFERENCES account_connection(account_id, institution_connection_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."account" validate constraint "account_account_connection_id_institution_connection_id_fkey";


