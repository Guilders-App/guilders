set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.log_account_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    NEW.updated_at := now();

    INSERT INTO public.account_history (
        account_id, updated_at, type, subtype, description, user_id, name, 
        taxability, value, currency, investable, notes, parent, connection_id, 
        cost, quantity, tax_rate, ticker, exchange_rate
    )
    VALUES (
        NEW.id, now(), NEW.type, NEW.subtype, NEW.description, NEW.user_id, NEW.name, 
        NEW.taxability, NEW.value, NEW.currency, NEW.investable, NEW.notes, NEW.parent, 
        NEW.connection_id, NEW.cost, NEW.quantity, NEW.tax_rate, NEW.ticker, NEW.exchange_rate
    );
    
    RETURN NEW;
END;$function$
;


