CREATE TRIGGER "TransactionEnrichment" AFTER INSERT ON public.transaction FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://api.guilders.app/callback/enrichment', 'POST', '{"Content-type":"application/json"}', '{}', '5000');


