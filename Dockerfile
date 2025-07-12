FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY ./app .

RUN npm install

RUN npm run build

FROM nginx:alpine

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

ENV SUPABASE_ANON_KEY=""
ENV SUPABASE_URL=""
# SENTRY_AUTH_TOKEN should be provided securely at runtime, not set in the Dockerfile

# Expose port 80 for HTTP traffic
EXPOSE 80/tcp
