alter table "public"."institution_connection" drop constraint "institution_connection_institution_fkey";

alter table "public"."account" add column "initialized" boolean not null default false;

alter table "public"."institution_connection" drop column "provider_id";


