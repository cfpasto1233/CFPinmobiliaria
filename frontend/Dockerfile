# Stage 1: Build
FROM oven/bun:1-slim AS build-stage

WORKDIR /app

COPY ./package.json ./bun.lock* /app/
COPY ./frontend/package.json /app/frontend/package.json

RUN bun install

COPY ./frontend /app/frontend/
WORKDIR /app/frontend
RUN bun run build

# Stage 2: Serve con Nginx
FROM nginx:1.27-alpine

COPY --from=build-stage /app/frontend/dist/frontend/browser/ /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
