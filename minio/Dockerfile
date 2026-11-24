# MinIO compilado desde el código fuente oficial.
#
# Motivo: la imagen oficial `minio/minio` ya no se puede descargar desde Docker Hub / Quay
# (Railway falla con "could not be pulled from the registry"), así que se compila aquí.
# El volumen /data existente se reutiliza tal cual.
#
# Para actualizar MinIO: cambia MINIO_TAG por otra etiqueta de https://github.com/minio/minio/tags
# (nunca bajes a una versión anterior a la que creó los datos del volumen).

FROM golang:1.24-alpine AS build
ARG MINIO_TAG=RELEASE.2025-09-07T16-13-09Z
RUN apk add --no-cache git
WORKDIR /src
RUN git clone --depth 1 --branch "${MINIO_TAG}" https://github.com/minio/minio.git .
RUN CGO_ENABLED=0 go build -trimpath \
      -ldflags "$(go run buildscripts/gen-ldflags.go "${MINIO_TAG}" 2>/dev/null || true)" \
      -o /out/minio . \
 && /out/minio --version

FROM alpine:3.21
RUN apk add --no-cache ca-certificates curl
COPY --from=build /out/minio /usr/local/bin/minio
ENV MINIO_ROOT_USER=minioadmin
EXPOSE 9000 9001
VOLUME ["/data"]
# Railway sobrescribe esto con el "Start command" del servicio: minio server /data --console-address ":9001"
CMD ["minio", "server", "/data", "--console-address", ":9001"]
