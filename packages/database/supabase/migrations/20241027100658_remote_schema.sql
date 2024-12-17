alter table "public"."account" drop constraint "account_connection_fkey";

alter table "public"."account" drop column "connection";

alter table "public"."account" add column "connection_id" bigint;

alter table "public"."account" add column "exchange_rate" double precision not null;

alter table "public"."account_history" drop column "connection";

alter table "public"."account_history" add column "connection_id" bigint;

alter table "public"."account_history" add column "exchange_rate" double precision not null;

alter table "public"."account" add constraint "account_connection_id_fkey" FOREIGN KEY (connection_id) REFERENCES connection(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."account" validate constraint "account_connection_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.log_account_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    NEW.updated_at := now();

    INSERT INTO public.account_history (account_id, updated_at, type, subtype, description, user_id, name, taxability, value, currency, investable, notes, parent, connection_id, cost, quantity, tax_rate, ticker, exchange_rate)
    VALUES (NEW.id, now(), NEW.type, NEW.subtype, NEW.description, NEW.user_id, NEW.name, NEW.taxability, NEW.value, NEW.currency, NEW.investable, NEW.notes, NEW.parent, NEW.connection_id, NEW.cost, NEW.quantity, NEW.tax_rate, NEW.ticker, exchange_rate);
    
    RETURN NEW;
END;$function$
;


