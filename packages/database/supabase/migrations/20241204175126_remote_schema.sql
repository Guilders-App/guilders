create table "public"."country" (
    "code" text not null,
    "name" text not null
);


alter table "public"."country" enable row level security;

CREATE UNIQUE INDEX country_pkey ON public.country USING btree (code);

alter table "public"."country" add constraint "country_pkey" PRIMARY KEY using index "country_pkey";

grant delete on table "public"."country" to "anon";

grant insert on table "public"."country" to "anon";

grant references on table "public"."country" to "anon";

grant select on table "public"."country" to "anon";

grant trigger on table "public"."country" to "anon";

grant truncate on table "public"."country" to "anon";

grant update on table "public"."country" to "anon";

grant delete on table "public"."country" to "authenticated";

grant insert on table "public"."country" to "authenticated";

grant references on table "public"."country" to "authenticated";

grant select on table "public"."country" to "authenticated";

grant trigger on table "public"."country" to "authenticated";

grant truncate on table "public"."country" to "authenticated";

grant update on table "public"."country" to "authenticated";

grant delete on table "public"."country" to "service_role";

grant insert on table "public"."country" to "service_role";

grant references on table "public"."country" to "service_role";

grant select on table "public"."country" to "service_role";

grant trigger on table "public"."country" to "service_role";

grant truncate on table "public"."country" to "service_role";

grant update on table "public"."country" to "service_role";


