# SNA Camp Reg Form

A registration for for SNA camps

Web client -> supabase database

Using Metabase for reports

## Running

### Client

```bash
(cd form && npm run dev)
```

## Testing with Selenium

```bash

cd form

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
- [ ] Write report pages for database
- [x] Tweak and tidy form

---

## deploying via argocd

```bash
# based on https://argo-cd.readthedocs.io/en/stable/getting_started/

kubectl config set-context --current --namespace=argocd

kubectl create ns sna-camp-form

argocd --insecure app create sna-camp-form --repo https://github.com/jujhars13/sna-camp-form --path kubernetes --dest-server https://kubernetes.sna-camp-form.svc --dest-namespace sna-camp-form

argocd --insecure app get sna-camp-form

# initial sync
argocd --insecure  app sync sna-camp-form

# run a test
NODE_ENV=test node_modules/.bin/mocha src/test/over8.spec.test.js

```
