# Camp reports (`/admin`)

Printable list of campers per camp, at `https://admin.snacamp.org/admin`.

```
browser → router (TLS) → oauth2-proxy (Google login) → reports (Node) → Supabase Postgres
```

- **Authentication:** oauth2-proxy accepts any Google account and passes the
  email to the app in `X-Forwarded-Email`. The reports container is only on a
  private network with oauth2-proxy, so that header can't be forged.
- **Authorisation:** `config/access.yaml` maps emails to camp names (`"*"` = all).
  It's committed and mounted into the container, so edits on the host are
  picked up without a restart. A malformed edit is logged and the previous
  list stays in force.
- **Camps** come from `app/src/data/*.json`, keyed by `name` (the value the
  form stores in `snacamp.campname`). Add a camp there and rebuild the image.
- **Query:** `src/db.js`. It selects the columns shown on the report
  (including a computed `age`) and excludes soft-deleted rows
  (`deleted IS NULL`). The table renders whatever columns the query returns,
  using the column names (or `AS` aliases) as headings, so changing the
  `SELECT` needs no other change.
- **Printing:** A4 landscape. The menu and buttons are hidden and the header
  row repeats on each page.

## Local development

```bash
docker compose -f compose.dev.yaml watch postgres reports
# http://localhost:3000/admin
```

There is no OAuth locally. `DEV_USER_EMAIL` (default `dev@localhost`) stands in
for the header, and `config/access.dev.yaml` applies (try
`DEV_USER_EMAIL=leader@localhost`). The database is seeded from
`../initdb` plus `initdb/020-dev-seed.sql`.

```bash
cd reports && npm install && npm test && npm run lint
```

## Production setup (one-off)

1. **DNS and router:** `admin.snacamp.org` points at the external router, which
   terminates TLS and forwards plain HTTP to port 80 on the compose host.
2. **Google Cloud console:** APIs & Services → Credentials → *OAuth client ID*
   (Web application).
   - Authorised redirect URI: `https://admin.snacamp.org/admin/oauth2/callback`
   - The consent screen can be *External* so non-Workspace Gmail users can sign in.
3. **`.env`** on the host (see `.env.template`): `DATABASE_URL`,
   `OAUTH2_PROXY_CLIENT_ID`, `OAUTH2_PROXY_CLIENT_SECRET`,
   `OAUTH2_PROXY_COOKIE_SECRET`.
4. **Database TLS:** download Supabase's CA cert (Project settings → Database →
   SSL configuration) into `reports/config/` and set `DATABASE_CA_FILE` to its
   path inside the container. Alternatively, set `DATABASE_SSL=require`.
5. **Recommended:** connect as a read-only role rather than `postgres`:
   ```sql
   CREATE ROLE reports_ro LOGIN PASSWORD '...';
   GRANT USAGE ON SCHEMA public TO reports_ro;
   GRANT SELECT ON public.snacamp TO reports_ro;
   -- RLS is on, so the role also needs a policy (or BYPASSRLS):
   CREATE POLICY reports_ro_select ON public.snacamp FOR SELECT TO reports_ro USING (true);
   ```
6. `docker compose up -d`

> oauth2-proxy (container `sna-camp-oauth2-proxy`) publishes :80 and is the
> only way in. `/` redirects to `/admin`. The cookie is `Secure`, so the site
> only works over HTTPS via the router.
