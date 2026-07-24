# Arquitectura — Cfpasto

## Componentes

- **Frontend**: Angular 21 (Signals + NgRx) servido por Nginx
- **Backend**: FastAPI + SQLAlchemy 2.x + Alembic
- **DB**: PostgreSQL 17
- **Cache**: Redis 7
- **Storage**: MinIO (S3-compatible) para archivos
- **Email dev**: Mailcatcher (SMTP local)
- **Deploy**: Docker Compose (archivos en raíz)

## Stack completo

```
Internet → Nginx (frontend) → Angular
         → FastAPI (backend) → PostgreSQL
                             → Redis
                             → MinIO
```

## Dominios del sistema

- **Auth**: login, logout, refresh token
- **Users**: perfil del usuario (email, nombre, avatar)
- **Propiedades**: catálogo de inmuebles (lectura pública, escritura superadmin), fotos en MinIO
- **[Módulos de negocio]**: se agregarán según evolucione el proyecto

## Autenticación

- **Access token**: JWT en memoria (no en localStorage ni cookie). 15 min de vida.
- **Refresh token**: httpOnly cookie SameSite=Lax. 7 días. Rotación automática.
- **Hashing**: Argon2id con fallback bcrypt (pwdlib)
- **JWT payload**: solo `sub=user_id`

## Rutas API actuales

```
POST /api/v1/login/access-token   → Login (devuelve access token)
POST /api/v1/auth/refresh          → Refresh access token (usa cookie)
POST /api/v1/auth/logout           → Logout (elimina cookie)
GET  /api/v1/users/me              → Perfil del usuario actual
PATCH /api/v1/users/me             → Actualizar perfil
GET  /api/v1/users/                → Listar usuarios (superuser)
POST /api/v1/users/                → Crear usuario (superuser)
GET  /api/v1/users/{id}            → Ver usuario (superuser)
PATCH /api/v1/users/{id}           → Editar usuario (superuser)
DELETE /api/v1/users/{id}          → Eliminar usuario (superuser)
GET  /api/v1/propiedades/          → Listar propiedades (público)
GET  /api/v1/propiedades/{id}      → Ver propiedad (público)
POST /api/v1/propiedades/          → Crear propiedad + foto principal (superuser)
PATCH /api/v1/propiedades/{id}     → Editar propiedad (superuser)
DELETE /api/v1/propiedades/{id}    → Eliminar propiedad y sus fotos (superuser)
POST /api/v1/propiedades/{id}/foto-principal → Reemplazar foto principal (superuser)
POST /api/v1/propiedades/{id}/fotos          → Agregar foto adicional (superuser)
DELETE /api/v1/propiedades/{id}/fotos/{foto_id} → Eliminar foto adicional (superuser)
GET  /api/v1/utils/health-check/   → Health check
```

## Rutas Frontend actuales

```
/                   Landing pública (sin auth)
/auth/login         Login
/auth/register      Registro
/dashboard          Dashboard (requiere auth)
```

## Flujos clave

### Login
```
Frontend → POST /api/v1/login/access-token
  → access_token en memoria JS
  → refresh_token en httpOnly cookie
  → GET /api/v1/users/me (cargar perfil en NgRx store)
  → redirigir a /dashboard
```

### Refresh automático
```
App.ts constructor → store.dispatch(AuthActions.refreshToken())
  → POST /api/v1/auth/refresh (cookie automática del browser)
  → nuevo access_token en memoria
  → GET /api/v1/users/me (cargar perfil)
```

### Logout
```
store.dispatch(AuthActions.logout())
  → clearAccessToken() (eliminar de memoria)
  → router.navigateByUrl('/auth/login')
```

## Patrón de capas (backend)

```
HTTP Request
  → FastAPI Router (api/routes/*.py)
  → Dependencies (api/deps.py) — auth, session
  → CRUD (crud/*.py) — operaciones de BD
  → SQLAlchemy Model → PostgreSQL
  → Pydantic Schema → HTTP Response
```

## Patrón de capas (frontend)

```
User Action
  → Component (dispatch action)
  → NgRx Effect (HTTP call via ng-openapi service)
  → NgRx Reducer (actualizar estado)
  → Component (leer via selectSignal)
  → Template (render)
```
