# Scout reports leaving the phone

Submit now hits `/api/scout-reports`. That route emails the review inbox and, if a database is connected, stores the row.

## Vercel env vars

Required for email (the first hole):

- `RESEND_API_KEY` — from https://resend.com
- `REVIEW_INBOX` — your email
- `RESEND_FROM` — optional. Until a domain is verified, use `ROMI Scouts <beth.t@example.com>` and send only to the Resend account email.

Required for `/review` queue:

- `DATABASE_URL` — Neon (or any Postgres) connection string
- `REVIEW_SECRET` — a password only you know

Optional:

- `NEXT_PUBLIC_APP_URL` — `https://romi-the-travel-companion.vercel.app`

## Check it

1. Open Scouts, enter your name + email, send a real place.
2. You should get the email.
3. Open `/review`, type `REVIEW_SECRET`, see the report.

If the card says **ON THIS PHONE ONLY**, the API did not accept it — env vars are missing or the send failed.
