FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY ./app .

RUN npm install

ARG SUPABASE_ANON_KEY=""
ARG SUPABASE_URL=""
ARG SENTRY_AUTH_TOKEN=""
ARG NODE_ENV=""
ARG VERSION=""

ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV NODE_ENV=${NODE_ENV}
ENV VERSION=${VERSION}

RUN npm run build

# Dev stage: deps only, no bundle. Used by compose.dev.yaml, which mounts the
# source in via compose watch and runs webpack-dev-server.
# Must stay above the final stage so a plain `docker build .` still targets nginx.
FROM node:24-bookworm-slim AS dev

WORKDIR /app

COPY ./app/package.json ./app/package-lock.json ./

RUN npm install

COPY ./app .

EXPOSE 8080/tcp

CMD ["npx", "webpack", "serve", "--host", "0.0.0.0", "--port", "8080"]

FROM nginx:alpine

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80/tcp
