# SNA Camp Reg Form

A registration for for SNA camps

Web client -> supabase database

Reports: `/admin` on admin.snapcamp.com (see [reports/README.md](reports/README.md)), Metabase for anything else

## Running

### Client

```bash
(cd app && npm run dev)
```

## Admin: camp reports

Organisers sign in with Google at <https://admin.snapcamp.com/admin>, pick a
camp from the menu and get a printable (A4 landscape) list of its campers.
The code is in [reports/](reports/), and [reports/README.md](reports/README.md)
has the full setup.

```
router (TLS) → oauth2-proxy (Google login) → reports (Node) → Supabase Postgres
```

### Common tasks

- **Give someone access:** add their Google email to
  [reports/config/access.yaml](reports/config/access.yaml), listing camp
  names or `"*"` for every camp. The running container picks up the change
  without a restart. If the YAML is malformed, the error is logged and the
  previous list stays in force, so check `docker logs sna-camp-reports` after
  editing.
- **Add a camp:** add its JSON to `app/src/data/`, as for the form. The report
  menu uses the same files, keyed by `name`, so the reports image needs
  rebuilding (tag a release) before the camp appears.
- **Change the report columns:** edit the SQL in
  [reports/src/db.js](reports/src/db.js). Column names and aliases become the
  table headings.
- **Run it locally:** no Google login. You're treated as `dev@localhost` and
  see every camp, with test data from a local Postgres.

  ```bash
  docker compose -f compose.dev.yaml watch postgres reports
  # http://localhost:3000/admin
  (cd reports && npm test)
  ```

### Production config

`.env` on the compose host needs `DATABASE_URL`, `OAUTH2_PROXY_CLIENT_ID`,
`OAUTH2_PROXY_CLIENT_SECRET` and `OAUTH2_PROXY_COOKIE_SECRET`
(see [.env.template](.env.template)). The Google OAuth client's redirect URI is
`https://admin.snapcamp.com/admin/oauth2/callback`.

> Anyone with a Google account can sign in, but they only see the camps
> `access.yaml` grants them. The reports container is reachable only through
> oauth2-proxy, so never publish its port or add it to another network.

## Testing with Selenium

```bash

cd app

npm i

npm test
```

## TODO

- [x] Finish basic form
- [x] setup Supabase project
- [x] Write unit test
- [x] Write db Schema for application
- [x] build and deploy application container
- [x] sort out reverse proxy and DNS for deployments
- [x] Write kustomize manifest for app
- [x] Add ability to customise form for different events
- [x] Test end to end integration
- [x] Write report pages for database
- [x] Tweak and tidy form

---

## deploying via argocd

```bash
# based on https://argo-cd.readthedocs.io/en/stable/getting_started/

kubectl config set-context --current --namespace=argocd

kubectl create ns sna-camp-form

argocd repo add git@github.com:jujhars13/sna-camp-reg-form.git --ssh-private-key-path ~/.ssh/github/id_rsa

argocd --insecure app create sna-camp-form \
  --repo git@github.com:jujhars13/sna-camp-reg-form.git \
  --path kubernetes/production \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace sna-camp-form

argocd --insecure app get sna-camp-form

# initial sync
argocd --insecure app sync sna-camp-form

# run a test
cd app
NODE_ENV=test node_modules/.bin/mocha src/test/over8.spec.test.js

```
