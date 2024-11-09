CREATE UNIQUE INDEX account_account_connection_id_key ON public.account USING btree (account_connection_id);

alter table "public"."account" add constraint "account_account_connection_id_key" UNIQUE using index "account_account_connection_id_key";


