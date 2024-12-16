alter table "public"."account" drop column "description";

CREATE UNIQUE INDEX unique_parent_name ON public.account USING btree (parent, name);

alter table "public"."account" add constraint "unique_parent_name" UNIQUE using index "unique_parent_name";


