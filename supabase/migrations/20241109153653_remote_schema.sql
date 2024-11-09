alter table "public"."institution_connection" alter column "institution_id" set data type bigint using "institution_id"::bigint;

alter table "public"."institution_connection" add constraint "institution_connection_institution_id_fkey" FOREIGN KEY (institution_id) REFERENCES institution(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."institution_connection" validate constraint "institution_connection_institution_id_fkey";


