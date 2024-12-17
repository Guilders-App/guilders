alter table "public"."account_connection" drop constraint "account_connection_institution_connection_fkey";

alter table "public"."account_connection" drop column "institution_connection";

alter table "public"."account_connection" add column "institution_connection_id" bigint not null;

alter table "public"."account_connection" add constraint "account_connection_institution_connection_id_fkey" FOREIGN KEY (institution_connection_id) REFERENCES institution_connection(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."account_connection" validate constraint "account_connection_institution_connection_id_fkey";


