alter table "public"."institution" drop column "countries";

alter table "public"."institution" add column "country" text;

alter table "public"."institution" add constraint "country_uppercase" CHECK (((country IS NULL) OR (country ~ '^[A-Z]{2}$'::text))) not valid;

alter table "public"."institution" validate constraint "country_uppercase";

alter table "public"."institution" add constraint "institution_country_fkey" FOREIGN KEY (country) REFERENCES country(code) not valid;

alter table "public"."institution" validate constraint "institution_country_fkey";

create policy "Enable read access for all users"
on "public"."country"
as permissive
for select
to public
using (true);



