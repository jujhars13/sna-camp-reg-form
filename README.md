# SNA Camp Reg Form

A registration for for SNA camps

Web client -> supabase database

Using Metabase for reports

## Running

### Client

```bash
(cd app && npm run dev)
```

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
- [ ] Write report pages for database
- [x] Tweak and tidy form

---

## deploying via argocd

```bash
# based on https://argo-cd.readthedocs.io/en/stable/getting_started/

kubectl config set-context --current --namespace=argocd

kubectl create ns sna-camp-reg-form

argocd repo add git@github.com:jujhars13/sna-camp-reg-form.git --ssh-private-key-path ~/.ssh/github/id_rsa

argocd --insecure app create sna-camp-reg-form \
  --repo git@github.com:jujhars13/sna-camp-reg-form.git \
  --path kubernetes/production \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace sna-camp-reg-form

argocd --insecure app get sna-camp-reg-form

# initial sync
argocd --insecure app sync sna-camp-reg-form

# run a test
NODE_ENV=test node_modules/.bin/mocha src/test/over8.spec.test.js

```
