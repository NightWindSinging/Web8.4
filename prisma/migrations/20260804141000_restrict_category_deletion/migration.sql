-- Prevent deleting categories that are still assigned to articles or products.
-- The CMS checks first for a friendly message; these constraints provide the
-- final database-level guarantee against orphaned category references.
ALTER TABLE "articles" DROP CONSTRAINT "articles_category_id_fkey";
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";

ALTER TABLE "articles"
ADD CONSTRAINT "articles_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "categories"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "products"
ADD CONSTRAINT "products_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "categories"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
