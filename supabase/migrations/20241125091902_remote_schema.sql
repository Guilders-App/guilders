alter type "public"."account_subtype" rename to "account_subtype__old_version_to_be_dropped";

create type "public"."account_subtype" as enum ('depository', 'brokerage', 'crypto', 'property', 'vehicle', 'creditcard', 'loan', 'stock');

alter table "public"."account" alter column subtype type "public"."account_subtype" using subtype::text::"public"."account_subtype";

drop type "public"."account_subtype__old_version_to_be_dropped";


