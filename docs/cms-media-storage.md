# CMS media storage

The CMS accepts JPG/JPEG, PNG and WebP images up to 10 MB. Media metadata is
stored in PostgreSQL; binary image data is stored in Cloudflare R2 when R2 is
configured, otherwise in local storage where that is safe.

## Cloudflare R2 (recommended)

Create an R2 bucket, an API token with Object Read & Write permission for that
bucket, and a public custom domain or R2 public development URL. Configure:

```dotenv
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=https://media.example.com
```

The browser uploads directly to an R2 signed PUT URL. The URL expires after ten
minutes. The CMS then verifies object size and content type with R2 before it
creates the `Media` database row.

Configure bucket CORS for the CMS origins. Replace the example origins with the
real production and local domains:

```json
[
  {
    "AllowedOrigins": ["https://www.example.com", "http://localhost:3100"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Local storage fallback

Local development automatically stores files below:

```text
public/uploads/media/YYYY/MM/<uuid>-<safe-file-name>.<extension>
```

The database stores both the public URL and the relative `storageKey`. Runtime
files are served through `/uploads/[...path]` with immutable browser caching and
content-type protection.

For a self-hosted production Node server with a persistent writable disk, enable:

```dotenv
MEDIA_LOCAL_STORAGE=true
```

Do not enable local storage on Vercel or another ephemeral serverless filesystem.
Use R2 there.

## Performance and security

- Upload code is under `/admin` and does not enter public-page client bundles.
- R2 uploads bypass the Next.js server, avoiding upload bandwidth and body-size
  pressure on the website runtime.
- File type and 10 MB size are checked in the browser and again on the server.
- Storage keys are UUID based and cannot traverse outside the uploads directory.
- Media in use by articles or products cannot be deleted from the CMS.
