CREATE UNIQUE INDEX unique_user_provider ON public.provider_connection USING btree (user_id, provider_id);

alter table "public"."provider_connection" add constraint "unique_user_provider" UNIQUE using index "unique_user_provider";


