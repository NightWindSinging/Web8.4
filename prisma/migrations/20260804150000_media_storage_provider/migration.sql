-- Track where each media object is stored so deletion and URL management use
-- the correct storage backend.
CREATE TYPE "MediaStorageProvider" AS ENUM ('R2', 'LOCAL');

ALTER TABLE "media"
ADD COLUMN "storage_provider" "MediaStorageProvider" NOT NULL DEFAULT 'LOCAL';

CREATE INDEX "media_storage_provider_idx" ON "media"("storage_provider");
