FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY ./app .

RUN npm install

ARG SUPABASE_ANON_KEY=""
ARG SUPABASE_URL=""
ARG SENTRY_AUTH_TOKEN=""

ENV SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV SUPABASE_URL=${SUPABASE_URL}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

RUN npm run build

FROM nginx:alpine

WORKDIR /app

COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80/tcp
