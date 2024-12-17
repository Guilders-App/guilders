alter table "public"."account" drop constraint "account_account_connection_id_fkey";

alter table "public"."account" drop constraint "account_account_connection_id_key";

alter table "public"."account" drop constraint "unique_user_account_connection";

drop index if exists "public"."account_account_connection_id_key";

drop index if exists "public"."unique_user_account_connection";

alter table "public"."account" drop column "account_connection_id";

alter table "public"."account" add column "institution_connection_id" bigint;

CREATE UNIQUE INDEX unique_account_connection_id_account_id ON public.account USING btree (institution_connection_id, account_id);

alter table "public"."account" add constraint "account_institution_connection_id_fkey" FOREIGN KEY (institution_connection_id) REFERENCES institution_connection(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."account" validate constraint "account_institution_connection_id_fkey";

alter table "public"."account" add constraint "unique_account_connection_id_account_id" UNIQUE using index "unique_account_connection_id_account_id";


