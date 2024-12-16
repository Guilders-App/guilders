create type "public"."subscription_status" as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');

drop policy "Enable for users based on user_id" on "public"."user_settings";

revoke delete on table "public"."user_settings" from "anon";

revoke insert on table "public"."user_settings" from "anon";

revoke references on table "public"."user_settings" from "anon";

revoke select on table "public"."user_settings" from "anon";

revoke trigger on table "public"."user_settings" from "anon";

revoke truncate on table "public"."user_settings" from "anon";

revoke update on table "public"."user_settings" from "anon";

revoke delete on table "public"."user_settings" from "authenticated";

revoke insert on table "public"."user_settings" from "authenticated";

revoke references on table "public"."user_settings" from "authenticated";

revoke select on table "public"."user_settings" from "authenticated";

revoke trigger on table "public"."user_settings" from "authenticated";

revoke truncate on table "public"."user_settings" from "authenticated";

revoke update on table "public"."user_settings" from "authenticated";

revoke delete on table "public"."user_settings" from "service_role";

revoke insert on table "public"."user_settings" from "service_role";

revoke references on table "public"."user_settings" from "service_role";

revoke select on table "public"."user_settings" from "service_role";

revoke trigger on table "public"."user_settings" from "service_role";

revoke truncate on table "public"."user_settings" from "service_role";

revoke update on table "public"."user_settings" from "service_role";

alter table "public"."user_settings" drop constraint "user_settings_currency_fkey";

alter table "public"."user_settings" drop constraint "user_settings_user_id_fkey";

alter table "public"."user_settings" drop constraint "user_settings_user_id_key";

alter table "public"."user_settings" drop constraint "user_settings_pkey";

drop index if exists "public"."user_settings_pkey";

drop index if exists "public"."user_settings_user_id_key";

drop table "public"."user_settings";

create table "public"."user_setting" (
    "user_id" uuid not null,
    "currency" text not null default 'EUR'::text,
    "api_key" text,
    "profile_url" text
);


alter table "public"."user_setting" enable row level security;

CREATE UNIQUE INDEX user_settings_pkey ON public.user_setting USING btree (user_id);

CREATE UNIQUE INDEX user_settings_user_id_key ON public.user_setting USING btree (user_id);

alter table "public"."user_setting" add constraint "user_settings_pkey" PRIMARY KEY using index "user_settings_pkey";

alter table "public"."user_setting" add constraint "user_setting_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_setting" validate constraint "user_setting_user_id_fkey";

alter table "public"."user_setting" add constraint "user_settings_currency_fkey" FOREIGN KEY (currency) REFERENCES currency(code) not valid;

alter table "public"."user_setting" validate constraint "user_settings_currency_fkey";

alter table "public"."user_setting" add constraint "user_settings_user_id_key" UNIQUE using index "user_settings_user_id_key";

grant delete on table "public"."user_setting" to "anon";

grant insert on table "public"."user_setting" to "anon";

grant references on table "public"."user_setting" to "anon";

grant select on table "public"."user_setting" to "anon";

grant trigger on table "public"."user_setting" to "anon";

grant truncate on table "public"."user_setting" to "anon";

grant update on table "public"."user_setting" to "anon";

grant delete on table "public"."user_setting" to "authenticated";

grant insert on table "public"."user_setting" to "authenticated";

grant references on table "public"."user_setting" to "authenticated";

grant select on table "public"."user_setting" to "authenticated";

grant trigger on table "public"."user_setting" to "authenticated";

grant truncate on table "public"."user_setting" to "authenticated";

grant update on table "public"."user_setting" to "authenticated";

grant delete on table "public"."user_setting" to "service_role";

grant insert on table "public"."user_setting" to "service_role";

grant references on table "public"."user_setting" to "service_role";

grant select on table "public"."user_setting" to "service_role";

grant trigger on table "public"."user_setting" to "service_role";

grant truncate on table "public"."user_setting" to "service_role";

grant update on table "public"."user_setting" to "service_role";

create policy "Enable for users based on user_id"
on "public"."user_setting"
as permissive
for all
to public
using ((check_mfa() AND (auth.uid() = user_id)))
with check ((check_mfa() AND (auth.uid() = user_id)));



