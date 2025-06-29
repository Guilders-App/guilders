create policy "Give users access to own folder for delete"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'user_files'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to own folder for insert"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'user_files'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to own folder for select"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'user_files'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));


create policy "Give users access to own folder for update"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'user_files'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



