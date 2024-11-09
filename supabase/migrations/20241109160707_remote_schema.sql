CREATE UNIQUE INDEX unique_user_account_connection ON public.account USING btree (user_id, account_connection_id);

alter table "public"."account" add constraint "unique_user_account_connection" UNIQUE using index "unique_user_account_connection";


