-- Add CMS-controlled mega-menu placement to product categories.
CREATE TYPE "CategoryNavigationGroup" AS ENUM ('PACKAGING_TYPE', 'INDUSTRY');

ALTER TABLE "categories"
  ADD COLUMN "navigation_group" "CategoryNavigationGroup",
  ADD COLUMN "navigation_order" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "navigation_image" VARCHAR(1200);

-- Preserve discoverability: existing product categories appear in the first menu group.
UPDATE "categories"
SET "navigation_group" = 'PACKAGING_TYPE'
WHERE "type" = 'PRODUCT';

CREATE INDEX "categories_type_navigation_group_navigation_order_idx"
  ON "categories"("type", "navigation_group", "navigation_order");
