# Build context is the repo root so the camp definitions in app/src/data can be
# copied in alongside the service:
#   docker build -f reports/Dockerfile .
FROM node:24-bookworm-slim

ENV NODE_ENV=production
WORKDIR /srv/reports

COPY reports/package.json reports/package-lock.json ./
RUN npm ci --omit=dev

COPY reports/src ./src
COPY reports/public ./public
COPY app/src/data ./data

# access.yaml is mounted at runtime, never baked in.
RUN mkdir -p config && chown node:node config
USER node

EXPOSE 3000/tcp

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "fetch('http://127.0.0.1:3000/admin/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
