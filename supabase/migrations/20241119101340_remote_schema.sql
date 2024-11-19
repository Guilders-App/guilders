revoke delete on table "public"."account_connection" from "anon";

revoke insert on table "public"."account_connection" from "anon";

revoke references on table "public"."account_connection" from "anon";

revoke select on table "public"."account_connection" from "anon";

revoke trigger on table "public"."account_connection" from "anon";

revoke truncate on table "public"."account_connection" from "anon";

revoke update on table "public"."account_connection" from "anon";

revoke delete on table "public"."account_connection" from "authenticated";

revoke insert on table "public"."account_connection" from "authenticated";

revoke references on table "public"."account_connection" from "authenticated";

revoke select on table "public"."account_connection" from "authenticated";

revoke trigger on table "public"."account_connection" from "authenticated";

revoke truncate on table "public"."account_connection" from "authenticated";

revoke update on table "public"."account_connection" from "authenticated";

revoke delete on table "public"."account_connection" from "service_role";

revoke insert on table "public"."account_connection" from "service_role";

revoke references on table "public"."account_connection" from "service_role";

revoke select on table "public"."account_connection" from "service_role";

revoke trigger on table "public"."account_connection" from "service_role";

revoke truncate on table "public"."account_connection" from "service_role";

revoke update on table "public"."account_connection" from "service_role";

alter table "public"."account_connection" drop constraint "account_connection_institution_connection_id_fkey";

alter table "public"."account_connection" drop constraint "unique_account_institution_connection";

alter table "public"."account_connection" drop constraint "account_connection_pkey";

drop index if exists "public"."account_connection_pkey";

drop index if exists "public"."unique_account_institution_connection";

drop table "public"."account_connection";


