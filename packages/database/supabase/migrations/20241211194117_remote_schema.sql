set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_account_folder()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM storage.objects 
    WHERE name LIKE CONCAT(OLD.user_id::text, '/accounts/', OLD.id::text, '%');

    RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_transaction_folder()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    userId uuid;
BEGIN
    -- Retrieve the user_id from the account table using the account_id from the transaction
    SELECT user_id INTO userId 
    FROM public.account 
    WHERE id = OLD.account_id;

    -- Delete objects from storage where the name matches the pattern
    DELETE FROM storage.objects 
    WHERE name LIKE CONCAT(userId::text, '/transactions/', OLD.id::text, '%');

    RETURN OLD;
END;
$function$
;

CREATE TRIGGER after_account_delete AFTER DELETE ON public.account FOR EACH ROW EXECUTE FUNCTION delete_account_folder();

CREATE TRIGGER after_transaction_delete AFTER DELETE ON public.transaction FOR EACH ROW EXECUTE FUNCTION delete_transaction_folder();


