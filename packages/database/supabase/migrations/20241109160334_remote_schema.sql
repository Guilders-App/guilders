CREATE UNIQUE INDEX unique_account_institution_connection ON public.account_connection USING btree (account_id, institution_connection_id);

alter table "public"."account_connection" add constraint "unique_account_institution_connection" UNIQUE using index "unique_account_institution_connection";


