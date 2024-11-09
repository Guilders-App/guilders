alter table "public"."account" drop column "connection_id";

alter table "public"."account" add column "account_id" bigint;

alter table "public"."account" add constraint "account_account_id_fkey" FOREIGN KEY (account_id) REFERENCES account_connection(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."account" validate constraint "account_account_id_fkey";


