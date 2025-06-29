revoke delete on table "public"."connection" from "anon";

revoke insert on table "public"."connection" from "anon";

revoke references on table "public"."connection" from "anon";

revoke select on table "public"."connection" from "anon";

revoke trigger on table "public"."connection" from "anon";

revoke truncate on table "public"."connection" from "anon";

revoke update on table "public"."connection" from "anon";

revoke delete on table "public"."connection" from "authenticated";

revoke insert on table "public"."connection" from "authenticated";

revoke references on table "public"."connection" from "authenticated";

revoke select on table "public"."connection" from "authenticated";

revoke trigger on table "public"."connection" from "authenticated";

revoke truncate on table "public"."connection" from "authenticated";

revoke update on table "public"."connection" from "authenticated";

revoke delete on table "public"."connection" from "service_role";

revoke insert on table "public"."connection" from "service_role";

revoke references on table "public"."connection" from "service_role";

revoke select on table "public"."connection" from "service_role";

revoke trigger on table "public"."connection" from "service_role";

revoke truncate on table "public"."connection" from "service_role";

revoke update on table "public"."connection" from "service_role";

alter table "public"."connection" drop constraint "connection_account_id_fkey";

alter table "public"."account" drop constraint "account_connection_id_fkey";

alter table "public"."connection" drop constraint "connection_pkey";

drop index if exists "public"."connection_pkey";

drop table "public"."connection";

create table "public"."institution" (
    "provider_id" bigint not null,
    "institution_id" character varying not null,
    "name" character varying not null,
    "countries" text[],
    "logo_url" text not null,
    "enabled" boolean not null default true
);


create table "public"."provider" (
    "id" bigint generated by default as identity not null,
    "name" character varying not null,
    "logo_url" character varying not null
);


create table "public"."provider_connection" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "secret" character varying not null,
    "user_id" uuid not null,
    "provider_id" bigint not null
);


drop type "public"."aggregator";

CREATE UNIQUE INDEX institution_pkey ON public.institution USING btree (provider_id, institution_id);

CREATE UNIQUE INDEX providers_pkey ON public.provider USING btree (id);

CREATE UNIQUE INDEX connection_pkey ON public.provider_connection USING btree (id);

alter table "public"."institution" add constraint "institution_pkey" PRIMARY KEY using index "institution_pkey";

alter table "public"."provider" add constraint "providers_pkey" PRIMARY KEY using index "providers_pkey";

alter table "public"."provider_connection" add constraint "connection_pkey" PRIMARY KEY using index "connection_pkey";

alter table "public"."institution" add constraint "institution_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES provider(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."institution" validate constraint "institution_provider_id_fkey";

alter table "public"."provider_connection" add constraint "connection_provider_id_fkey" FOREIGN KEY (provider_id) REFERENCES provider(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."provider_connection" validate constraint "connection_provider_id_fkey";

alter table "public"."provider_connection" add constraint "connection_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."provider_connection" validate constraint "connection_user_id_fkey";

alter table "public"."account" add constraint "account_connection_id_fkey" FOREIGN KEY (connection_id) REFERENCES provider_connection(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."account" validate constraint "account_connection_id_fkey";

grant delete on table "public"."institution" to "anon";

grant insert on table "public"."institution" to "anon";

grant references on table "public"."institution" to "anon";

grant select on table "public"."institution" to "anon";

grant trigger on table "public"."institution" to "anon";

grant truncate on table "public"."institution" to "anon";

grant update on table "public"."institution" to "anon";

grant delete on table "public"."institution" to "authenticated";

grant insert on table "public"."institution" to "authenticated";

grant references on table "public"."institution" to "authenticated";

grant select on table "public"."institution" to "authenticated";

grant trigger on table "public"."institution" to "authenticated";

grant truncate on table "public"."institution" to "authenticated";

grant update on table "public"."institution" to "authenticated";

grant delete on table "public"."institution" to "service_role";

grant insert on table "public"."institution" to "service_role";

grant references on table "public"."institution" to "service_role";

grant select on table "public"."institution" to "service_role";

grant trigger on table "public"."institution" to "service_role";

grant truncate on table "public"."institution" to "service_role";

grant update on table "public"."institution" to "service_role";

grant delete on table "public"."provider" to "anon";

grant insert on table "public"."provider" to "anon";

grant references on table "public"."provider" to "anon";

grant select on table "public"."provider" to "anon";

grant trigger on table "public"."provider" to "anon";

grant truncate on table "public"."provider" to "anon";

grant update on table "public"."provider" to "anon";

grant delete on table "public"."provider" to "authenticated";

grant insert on table "public"."provider" to "authenticated";

grant references on table "public"."provider" to "authenticated";

grant select on table "public"."provider" to "authenticated";

grant trigger on table "public"."provider" to "authenticated";

grant truncate on table "public"."provider" to "authenticated";

grant update on table "public"."provider" to "authenticated";

grant delete on table "public"."provider" to "service_role";

grant insert on table "public"."provider" to "service_role";

grant references on table "public"."provider" to "service_role";

grant select on table "public"."provider" to "service_role";

grant trigger on table "public"."provider" to "service_role";

grant truncate on table "public"."provider" to "service_role";

grant update on table "public"."provider" to "service_role";

grant delete on table "public"."provider_connection" to "anon";

grant insert on table "public"."provider_connection" to "anon";

grant references on table "public"."provider_connection" to "anon";

grant select on table "public"."provider_connection" to "anon";

grant trigger on table "public"."provider_connection" to "anon";

grant truncate on table "public"."provider_connection" to "anon";

grant update on table "public"."provider_connection" to "anon";

grant delete on table "public"."provider_connection" to "authenticated";

grant insert on table "public"."provider_connection" to "authenticated";

grant references on table "public"."provider_connection" to "authenticated";

grant select on table "public"."provider_connection" to "authenticated";

grant trigger on table "public"."provider_connection" to "authenticated";

grant truncate on table "public"."provider_connection" to "authenticated";

grant update on table "public"."provider_connection" to "authenticated";

grant delete on table "public"."provider_connection" to "service_role";

grant insert on table "public"."provider_connection" to "service_role";

grant references on table "public"."provider_connection" to "service_role";

grant select on table "public"."provider_connection" to "service_role";

grant trigger on table "public"."provider_connection" to "service_role";

grant truncate on table "public"."provider_connection" to "service_role";

grant update on table "public"."provider_connection" to "service_role";


