drop trigger if exists "account_update_trigger" on "public"."account";

revoke delete on table "public"."account_history" from "anon";

revoke insert on table "public"."account_history" from "anon";

revoke references on table "public"."account_history" from "anon";

revoke select on table "public"."account_history" from "anon";

revoke trigger on table "public"."account_history" from "anon";

revoke truncate on table "public"."account_history" from "anon";

revoke update on table "public"."account_history" from "anon";

revoke delete on table "public"."account_history" from "authenticated";

revoke insert on table "public"."account_history" from "authenticated";

revoke references on table "public"."account_history" from "authenticated";

revoke select on table "public"."account_history" from "authenticated";

revoke trigger on table "public"."account_history" from "authenticated";

revoke truncate on table "public"."account_history" from "authenticated";

revoke update on table "public"."account_history" from "authenticated";

revoke delete on table "public"."account_history" from "service_role";

revoke insert on table "public"."account_history" from "service_role";

revoke references on table "public"."account_history" from "service_role";

revoke select on table "public"."account_history" from "service_role";

revoke trigger on table "public"."account_history" from "service_role";

revoke truncate on table "public"."account_history" from "service_role";

revoke update on table "public"."account_history" from "service_role";

alter table "public"."account_history" drop constraint "account_history_account_id_fkey";

drop function if exists "public"."log_account_update"();

alter table "public"."account_history" drop constraint "account_history_pkey";

drop index if exists "public"."account_history_pkey";

drop table "public"."account_history";

alter table "public"."institution" add column "demo" boolean not null default false;


