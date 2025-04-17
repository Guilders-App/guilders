alter table "public"."transaction" drop column "category";

alter table "public"."transaction" add column "category_id" bigint not null default 29;

CREATE INDEX idx_transaction_category_id ON public.transaction USING btree (category_id);

CREATE UNIQUE INDEX transaction_category_id_key ON public.transaction_category USING btree (id);

alter table "public"."transaction" add constraint "transaction_category_id_fkey" FOREIGN KEY (category_id) REFERENCES transaction_category(id) ON UPDATE CASCADE ON DELETE SET DEFAULT not valid;

alter table "public"."transaction" validate constraint "transaction_category_id_fkey";

alter table "public"."transaction_category" add constraint "transaction_category_id_key" UNIQUE using index "transaction_category_id_key";


