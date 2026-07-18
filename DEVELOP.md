# Guía de Desarrollo — Cfpasto

Instrucciones completas para levantar el ambiente local, generar el cliente HTTP y usar los scripts del proyecto.

---

## Índice

1. [Requisitos previos](#1-requisitos-previos)
2. [Levantar el ambiente local](#2-levantar-el-ambiente-local)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Servicios y puertos locales](#4-servicios-y-puertos-locales)
5. [Generación del cliente HTTP](#5-generación-del-cliente-http)
6. [Scripts del proyecto](#6-scripts-del-proyecto)
7. [Desarrollo frontend sin Docker](#7-desarrollo-frontend-sin-docker)
8. [Desarrollo backend sin Docker](#8-desarrollo-backend-sin-docker)
9. [Migraciones de base de datos](#9-migraciones-de-base-de-datos)
10. [Flujo completo de una nueva feature](#10-flujo-completo-de-una-nueva-feature)
11. [Problemas comunes](#11-problemas-comunes)

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Instalación |
|---|---|---|
| Docker Desktop | 4.x | https://www.docker.com/products/docker-desktop |
| UV (Python) | 0.6+ | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Node.js | 20+ | https://nodejs.org |
| Git | 2.x | https://git-scm.com |

---

## 2. Levantar el ambiente local

### Primera vez

```bash
# 1. Entrar al proyecto
cd D:\Proyectos\Cfpasto

# 2. Revisar archivo de entorno (ya viene generado)
# Editar .env con tus valores si es necesario

# 3. Generar uv.lock (necesario para el build Docker del backend)
uv sync

# 4. Instalar dependencias del frontend
cd frontend && npm install && cd ..

# 5. Construir imágenes Docker
docker compose build

# 6. Levantar stack completo
docker compose up -d

# 7. Esperar a que el backend esté sano (~30 seg) y generar cliente HTTP
bash scripts/generate-client.sh
```

> **Nota:** Los pasos 3–7 solo se necesitan la primera vez o cuando cambia el schema de la API.

### Días siguientes (stack ya inicializado)

```bash
docker compose up -d
```

### Ver logs en vivo

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f        # todos los servicios
```

### Detener el stack

```bash
docker compose down           # mantiene volúmenes (datos intactos)
docker compose down -v        # destruye volúmenes (reset total de datos)
```

---

## 3. Variables de entorno

El archivo `.env` en la raíz controla toda la configuración. Nunca commitear `.env` — está en `.gitignore`.

### Referencia completa

```env
# ── Docker ──────────────────────────────────────────────────
DOCKER_IMAGE_BACKEND=cfpasto-backend
DOCKER_IMAGE_FRONTEND=cfpasto-frontend
TAG=latest
STACK_NAME=cfpasto
DOMAIN=localhost

# ── PostgreSQL ───────────────────────────────────────────────
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<tu-password>         # CAMBIAR
POSTGRES_DB=app

# ── Backend ──────────────────────────────────────────────────
PROJECT_NAME=Cfpasto
SECRET_KEY=<mínimo-32-chars>            # CAMBIAR — usar: openssl rand -hex 32
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=<password>     # CAMBIAR

# ── URLs y CORS ──────────────────────────────────────────────
FRONTEND_HOST=http://localhost:4200
ENVIRONMENT=local
BACKEND_CORS_ORIGINS=http://localhost:4200

# ── SMTP (dev: mailcatcher, ver puerto 1080) ─────────────────
SMTP_HOST=mailcatcher
SMTP_PORT=1025
SMTP_TLS=false
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=noreply@cfpasto.com

# ── MinIO (almacenamiento S3-compatible) ─────────────────────
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=<tu-password>       # CAMBIAR
MINIO_BUCKET=cfpasto
MINIO_ENDPOINT=minio:9000
STORAGE_BACKEND=minio

# ── Redis ────────────────────────────────────────────────────
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=changeme                 # CAMBIAR
REDIS_DB=0
```

### Generar SECRET_KEY segura

```bash
# Linux/Mac
openssl rand -hex 32

# Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
```

### Si cambias POSTGRES_PASSWORD y ya tienes un volumen

```bash
docker compose down -v   # borra volúmenes, incluyendo datos de la DB
docker compose up -d     # reinicia desde cero
```

---

## 4. Servicios y puertos locales

| Servicio | URL local | Descripción |
|---|---|---|
| **Frontend** | http://localhost:4200 | App Angular (Nginx en Docker) |
| **Backend API** | http://localhost:8000 | FastAPI |
| **Swagger UI** | http://localhost:8000/docs | Documentación interactiva de la API |
| **ReDoc** | http://localhost:8000/redoc | Documentación alternativa |
| **MinIO Console** | http://localhost:9001 | Panel de administración de MinIO |
| **MinIO S3 API** | http://localhost:9000 | Endpoint S3 compatible |
| **Mailcatcher** | http://localhost:1080 | Captura de emails enviados en dev |
| **Redis** | localhost:6379 | Solo accesible desde localhost |
| **PostgreSQL** | localhost:5432 | Conexión directa desde host |

---

## 5. Generación del cliente HTTP

El frontend **no puede compilar** sin el cliente generado. El cliente se genera automáticamente desde el OpenAPI del backend.

### Cuándo regenerar

- Al agregar, modificar o eliminar un endpoint en el backend
- Al cambiar un schema Pydantic que se expone en la API
- Al configurar el proyecto por primera vez

### Pasos

```bash
# El backend debe estar corriendo en localhost:8000
bash scripts/generate-client.sh
```

### ¿Qué genera?

```
frontend/src/client/
├── models/
│   └── index.ts     # Todas las interfaces TypeScript (un solo archivo)
├── services/        # Angular services con métodos tipados por endpoint
│   ├── index.ts     # Barrel de exports de servicios
│   ├── login.service.ts
│   ├── users.service.ts
│   └── utils.service.ts
├── tokens/
│   └── index.ts     # Injection tokens (base path, interceptors)
├── utils/           # Interceptor base, transformador de fechas, helpers
├── providers.ts     # provideDefaultClient() para app.config.ts
└── index.ts         # Barrel principal
```

> **Regla:** Nunca editar manualmente `frontend/src/client/`. Los cambios se pierden al regenerar.

### Configuración del generador

Archivo: `frontend/openapi.config.ts`

```typescript
import { defineConfig } from 'ng-openapi';

export default defineConfig({
  input: 'http://localhost:8000/api/v1/openapi.json',
  output: './src/client',
  options: {
    dateType: 'string',
    enumStyle: 'enum',
  },
});
```

---

## 6. Scripts del proyecto

### `scripts/generate-client.sh`

Genera el cliente Angular desde el OpenAPI del backend.

```bash
bash scripts/generate-client.sh
```

**Requiere:** backend corriendo en `localhost:8000` y `node` + `uv` instalados.

---

### `backend/scripts/prestart.sh`

Script que corre dentro del contenedor `prestart` de Docker:

1. Espera a que PostgreSQL esté disponible (`backend_pre_start.py`)
2. Aplica migraciones Alembic (`alembic upgrade head`)
3. Crea datos iniciales (`initial_data.py` — superusuario si no existe)

```bash
# Para correr migraciones manualmente desde el host:
cd backend
POSTGRES_SERVER=localhost uv run alembic upgrade head
```

---

## 7. Desarrollo frontend sin Docker

Para desarrollo activo del frontend con hot-reload:

```bash
# El backend debe estar corriendo (con Docker)
cd frontend
npm run start      # levanta ng serve en http://localhost:4200
```

El proxy está configurado en `proxy.conf.json` para redirigir `/api` → `http://localhost:8000`.

### Scripts disponibles en `frontend/`

```bash
npm run start               # ng serve con proxy
npm run build               # build de producción
npm run generate:client     # solo regenera el cliente HTTP
```

---

## 8. Desarrollo backend sin Docker

Para correr el backend localmente (requiere PostgreSQL y Redis accesibles):

```bash
# Con Docker corriendo solo la infraestructura
docker compose up -d db redis minio

# Correr el backend en modo desarrollo con hot-reload
cd backend
POSTGRES_SERVER=localhost REDIS_HOST=localhost \
MINIO_ENDPOINT=minio:9000 \
uv run fastapi run --reload app/main.py
```

La API quedará disponible en `http://localhost:8000`.

### Agregar una dependencia Python

```bash
cd backend
uv add <paquete>          # agrega y actualiza uv.lock automáticamente
```

---

## 9. Migraciones de base de datos

### Generar una nueva migración

```bash
# Con la DB corriendo (Docker o local)
cd backend
POSTGRES_SERVER=localhost \
uv run alembic revision --autogenerate -m "descripcion_del_cambio"
```

El archivo se crea en `backend/app/alembic/versions/`.

### Aplicar migraciones

```bash
# Desde el host (con DB en Docker)
cd backend
POSTGRES_SERVER=localhost \
uv run alembic upgrade head

# O reiniciando el stack (el contenedor prestart aplica migraciones automáticamente)
docker compose up -d
```

### Ver estado de migraciones

```bash
cd backend
POSTGRES_SERVER=localhost uv run alembic current
uv run alembic history
```

### Revertir última migración

```bash
cd backend
POSTGRES_SERVER=localhost uv run alembic downgrade -1
```

---

## 10. Flujo completo de una nueva feature

Ejemplo: agregar el módulo "Clientes".

### Paso 1 — Modelo en backend

```bash
# Crear el modelo SQLAlchemy en backend/app/models/cliente.py
# Agregar a backend/app/models/__init__.py
```

### Paso 2 — Schema Pydantic

```bash
# Crear schemas en backend/app/schemas/cliente.py
# ClienteCreate, ClienteUpdate, ClientePublic, ClientesPublic
```

### Paso 3 — CRUD

```bash
# Crear backend/app/crud/cliente.py
# create_cliente, update_cliente, get_by_id, list_clientes
```

### Paso 4 — Endpoints FastAPI

```bash
# Crear backend/app/api/routes/clientes.py
# Registrar en backend/app/api/main.py:
# api_router.include_router(clientes.router)
```

### Paso 5 — Migración

```bash
cd backend
POSTGRES_SERVER=localhost \
uv run alembic revision --autogenerate -m "add_clientes_table"
# Revisar el archivo generado antes de aplicar
POSTGRES_SERVER=localhost \
uv run alembic upgrade head
```

### Paso 6 — Regenerar cliente

```bash
# Con el backend corriendo
bash scripts/generate-client.sh
```

### Paso 7 — NgRx Store

```bash
# Crear frontend/src/app/store/Clientes/
#   clientes.actions.ts
#   clientes.reducer.ts
#   clientes.selectors.ts
#   clientes.effects.ts
# Registrar en store/index.ts y app.config.ts
```

### Paso 8 — Componente Angular

```bash
# Crear frontend/src/app/features/dashboard/clientes/clientes.component.ts
# Agregar ruta en frontend/src/app/app.routes.ts
```

### Paso 9 — Verificar

```bash
cd frontend && npm run build    # debe compilar sin errores
docker compose build backend frontend
docker compose up -d
```

---

## 11. Problemas comunes

### El frontend no compila: "Cannot find module '../client/providers'"

El cliente HTTP no ha sido generado. Solución:

```bash
# Backend debe estar corriendo
bash scripts/generate-client.sh
```

### Error de migración: "uv.lock not found" al hacer docker compose build

El `uv.lock` no existe. Generarlo:

```bash
uv sync    # genera uv.lock en la raíz
```

### Error de prestart: "relation 'users' does not exist"

No hay migraciones generadas. Solución:

```bash
cd backend
POSTGRES_SERVER=localhost \
uv run alembic revision --autogenerate -m "initial"
docker compose build backend
docker compose up -d
```

### POSTGRES_PASSWORD cambió pero el volumen tiene la contraseña anterior

```bash
docker compose down -v    # ⚠️ borra todos los datos
docker compose up -d
```

### El backend falla con "could not connect to Redis"

Verificar que `REDIS_PASSWORD` en `.env` coincide con la configuración de Redis. En dev, el valor por defecto es `changeme`.

### Cambios en `frontend/src/` no se reflejan en la imagen Docker

El Docker usa una build estática. Reconstruir:

```bash
docker compose build frontend
docker compose up -d frontend
```

Para desarrollo activo con hot-reload, usar `npm run start` directamente (ver sección 7).
