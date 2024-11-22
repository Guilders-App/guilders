alter table "public"."account" drop constraint "unique_account_connection_id_account_id";

drop index if exists "public"."unique_account_connection_id_account_id";

alter table "public"."account" drop column "account_id";

alter table "public"."account" add column "provider_account_id" text;

alter table "public"."transaction" alter column "account_id" set not null;

alter table "public"."transaction" alter column "category" set default 'uncategorized'::text;

alter table "public"."transaction" alter column "category" set not null;

CREATE UNIQUE INDEX account_id_key ON public.account USING btree (id);

CREATE UNIQUE INDEX unique_provider_transaction_account ON public.transaction USING btree (provider_transaction_id, account_id);

CREATE UNIQUE INDEX unique_account_connection_id_account_id ON public.account USING btree (institution_connection_id, provider_account_id);

alter table "public"."account" add constraint "account_id_key" UNIQUE using index "account_id_key";

alter table "public"."transaction" add constraint "unique_provider_transaction_account" UNIQUE using index "unique_provider_transaction_account";

alter table "public"."account" add constraint "unique_account_connection_id_account_id" UNIQUE using index "unique_account_connection_id_account_id";

create policy "Transaction policy based on account user_id"
on "public"."transaction"
as permissive
for all
to public
using ((( SELECT auth.uid() AS uid) IN ( SELECT account.user_id
   FROM account
  WHERE (transaction.account_id = account.id))))
with check ((( SELECT auth.uid() AS uid) IN ( SELECT account.user_id
   FROM account
  WHERE (transaction.account_id = account.id))));



