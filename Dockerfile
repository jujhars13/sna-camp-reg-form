FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY ./app .

RUN npm install

RUN npm run build

FROM nginx:alpine

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

ENV SUPABASE_ANON_KEY, SUPABASE_URL, SENTRY_AUTH_TOKEN

# Expose port 80 for HTTP traffic
EXPOSE 80/tcp
