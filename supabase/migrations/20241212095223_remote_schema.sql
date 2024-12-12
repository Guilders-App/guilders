drop policy "Enable users based on user_id" on "public"."account";

drop policy "Policy with table joins" on "public"."institution_connection";

drop policy "Enable for users based on user_id" on "public"."provider_connection";

drop policy "Transaction policy based on account user_id" on "public"."transaction";

drop policy "Enable for users based on user_id" on "public"."user_settings";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_mfa()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN (
        array[auth.jwt()->>'aal'] <@ (
            SELECT
                CASE
                    WHEN count(id) > 0 THEN array['aal2']
                    ELSE array['aal1', 'aal2']
                END
            FROM auth.mfa_factors
            WHERE auth.uid() = user_id AND status = 'verified'
        )
    );
END;
$function$
;

create policy "Enable users based on user_id"
on "public"."account"
as permissive
for all
to public
using ((check_mfa() AND (auth.uid() = user_id)))
with check ((check_mfa() AND (auth.uid() = user_id)));


create policy "Policy with table joins"
on "public"."institution_connection"
as permissive
for all
to public
using ((check_mfa() AND (auth.uid() IN ( SELECT provider_connection.user_id
   FROM provider_connection
  WHERE (institution_connection.provider_connection_id = provider_connection.id)))))
with check ((check_mfa() AND (auth.uid() IN ( SELECT provider_connection.user_id
   FROM provider_connection
  WHERE (institution_connection.provider_connection_id = provider_connection.id)))));


create policy "Enable for users based on user_id"
on "public"."provider_connection"
as permissive
for all
to public
using ((check_mfa() AND (auth.uid() = user_id)))
with check ((check_mfa() AND (auth.uid() = user_id)));


create policy "Transaction policy based on account user_id"
on "public"."transaction"
as permissive
for all
to public
using ((check_mfa() AND (auth.uid() IN ( SELECT account.user_id
   FROM account
  WHERE (transaction.account_id = account.id)))))
with check ((check_mfa() AND (auth.uid() IN ( SELECT account.user_id
   FROM account
  WHERE (transaction.account_id = account.id)))));


create policy "Enable for users based on user_id"
on "public"."user_settings"
as permissive
for all
to public
using ((check_mfa() AND (auth.uid() = user_id)))
with check ((check_mfa() AND (auth.uid() = user_id)));



