drop trigger if exists "provider_connection_delete_trigger" on "public"."provider_connection";

drop function if exists "public"."delete_institution_connections"();

alter table "public"."institution_connection" add column "provider_id" bigint not null;

alter table "public"."institution_connection" add constraint "institution_connection_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES provider(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."institution_connection" validate constraint "institution_connection_provider_id_fkey";


