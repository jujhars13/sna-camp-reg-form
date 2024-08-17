# multi stage build to keep prod clean
FROM node:22-bookworm AS builder

COPY ./ /app

# some environment defaults
ENV NODE_ENV=production
ENV LOG_LEVEL=debug
ENV DEBUG=debug

WORKDIR /app

RUN rm -rf node_modules && npm install --omit=dev

# remove files that won't be used in prod
RUN rm -rf app/test app/Dockerfile app/Dockerfile.dev

# ------------------------#

# final low surface-area container
FROM node:22-bookworm

ENV NODE_ENV=production
ENV PORT=8080
ENV LOG_LEVEL=debug
ENV DEBUG=debug
ENV APPLICATION_NAME=sna-camp-admin-pages

WORKDIR /app

# grab app w/ node_modules from above
COPY --from=builder /app .

# don't run as root in prod
USER node

EXPOSE 8080

ENTRYPOINT ["node"]
CMD [ "bin/www"]
