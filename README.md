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
- [ ] build and deploy application container
- [x] sort out reverse proxy and DNS for deployments
- [ ] Write kustomize manifest for app
- [ ] Add ability to customise form for different events
- [ ] Test end to end integration
- [ ] Write report pages for database
- [ ] Tweak and tidy form

---

## deploying via argocd

```bash
# based on https://argo-cd.readthedocs.io/en/stable/getting_started/

kubectl config set-context --current --namespace=argocd

argocd --insecure app create sna-camp-reg-form --repo https://github.com/jujhars13/sna-camp-reg-form --path kubernetes --dest-server https://kubernetes.sna-camp-reg-form.svc --dest-namespace sna-camp-reg-form

argocd --insecure app get sna-camp-reg-form

# initial sync
argocd --insecure  app sync sna-camp-reg-form

```
