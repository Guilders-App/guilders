alter table "public"."account" alter column "notes" set default ''::text;

alter table "public"."user_settings" add column "profile_url" text;


