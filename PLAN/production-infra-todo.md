# Production infra todo

## Supabase / PostgreSQL

Current local development still uses SQLite to avoid breaking the running server before a real Supabase connection string is available.

To switch production to Supabase PostgreSQL:

1. Create a Supabase project.
2. Provide `DATABASE_URL` from Supabase. Prefer direct connection for migration and pooled connection for runtime if Supabase recommends it for the deployment target.
3. Change `backend/prisma/schema.prisma` datasource provider from `sqlite` to `postgresql`.
4. Run:

```powershell
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:push
npm --prefix backend run prisma:seed
```

Required from owner:

- Supabase project URL for reference.
- Supabase PostgreSQL connection string.
- Decision on migration strategy: `db push` for early MVP or versioned Prisma migrations before production launch.

## Cloudflare Turnstile

Implemented as optional public booking protection.

Backend env:

```env
TURNSTILE_ENABLED=true
TURNSTILE_SECRET_KEY="..."
```

Frontend env:

```env
VITE_TURNSTILE_SITE_KEY="..."
```

Required from owner:

- Turnstile site key.
- Turnstile secret key.
- Allowed hostnames: local tunnel domain, staging domain, production domain.

## Cloudflare R2 uploads

Implemented behind the existing media upload API. Default remains local storage.

Provisioned on 2026-05-04:

- Account ID: `abd30598a3ca63eefde2e93deb6245c7`
- Bucket: `anvoyages-media`
- Region hint: `APAC`
- Public r2.dev domain: `https://pub-cc52d0d156684b5da8c4bb0f163eb065.r2.dev`

Backend env:

```env
UPLOAD_DRIVER="r2"
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="anvoyages-media"
R2_PUBLIC_BASE_URL="https://media.yourdomain.com"
```

Required from owner:

- R2 account ID.
- R2 bucket name.
- R2 access key ID.
- R2 secret access key.
- Public base URL, ideally a custom domain on the bucket.

## CRM / ERP connector direction

The backend now has provider definitions for:

- Facebook
- Instagram
- Zalo
- TikTok
- Sepay
- MISA AMIS
- NextERP
- Odoo
- VietERP
- Generic Webhook

Next production step:

1. Store connector credentials encrypted, not plain JSON.
2. Add a connector job queue for retries and audit logs.
3. Add outbound sync events: `new_lead`, `booking_confirmed`, `payment_success`, `booking_cancelled`.
4. Implement provider-specific adapters once API docs and credentials are available.

Required from owner per ERP:

- API documentation link.
- Sandbox/base URL.
- Auth method and test credentials.
- Mapping requirements: customer, booking/order, invoice, payment receipt.
