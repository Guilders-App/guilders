alter table "public"."account" alter column "value" set data type double precision using "value"::double precision;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_institution_connections()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN

    
DELETE
 
FROM
 institution_connection
    
WHERE
 institution_id 
IN
 (
        
SELECT
 id 
FROM
 institution 
WHERE
 provider_id 
=
 OLD.provider_id
    );
    
RETURN
 
OLD
;
END
;
$function$
;

CREATE TRIGGER provider_connection_delete_trigger AFTER DELETE ON public.provider_connection FOR EACH ROW EXECUTE FUNCTION delete_institution_connections();


