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
- [x] Write Schema for application
- [ ] Add ability to customise form for different events
- [ ] Test end to end integration
- [ ] Write report pages for database
- [ ] Tweak and tidy form

---

## deploying via argocd

```bash

kubectl config set-context --current --namespace=argocd

argocd app create sna-camp-reg-form --repo https://github.com/jujhars13/sna-camp-reg-form --path kubernetes --dest-server https://kubernetes.sna-camp-reg-form.svc --dest-namespace sna-camp-reg-form
```
