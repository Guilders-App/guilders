create policy "Enable read access for all users"
on "public"."transaction_category"
as permissive
for select
to public
using (true);



