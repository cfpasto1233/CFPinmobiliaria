# Stage 1: Build
FROM node:22-slim AS build-stage

WORKDIR /app

COPY ./package.json ./package-lock.json* /app/
COPY ./frontend/package.json /app/frontend/package.json

RUN npm install

COPY ./frontend /app/frontend/
WORKDIR /app/frontend
RUN npm run build

# Stage 2: Serve con Nginx
FROM nginx:1.27-alpine

COPY --from=build-stage /app/frontend/dist/frontend/browser/ /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
