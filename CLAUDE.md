# Cfpasto — Guía para Claude

Este es el archivo canónico de instrucciones para el repo. `AGENTS.md` es un suplemento
compacto de lo que se suele pasar por alto; `docs/*.md` tiene el detalle profundo por área.

## Stack
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.x (sin SQLModel), Alembic, PostgreSQL 17
- **Frontend:** Angular 21 (standalone + Signals + OnPush), NgRx clásico, Bootstrap 5.3, ng-openapi
- **Infra:** Docker Compose, Redis 7 (cache + rate limiting), MinIO (S3), Mailcatcher (SMTP dev)
- **Herramientas:** uv (Python, workspace en `pyproject.toml` root con `members=["backend"]`), **npm** (Node 20+, no bun/yarn)

## Arquitectura

```
Internet → Nginx (frontend, prod) → Angular
         → FastAPI (backend) → PostgreSQL
                             → Redis
                             → MinIO
```

**Patrón de capas backend:** HTTP → Router (`api/routes/*.py`) → Dependencies (`api/deps.py`:
`SessionDep`, `CurrentUser`, `SuperUser`) → CRUD (`crud/*.py`) → Modelo SQLAlchemy → Schema Pydantic.

**Patrón de capas frontend:** Component (dispatch action) → NgRx Effect (llama al servicio
generado por ng-openapi) → Reducer → Component (`store.selectSignal(...)`) → Template.
Los componentes **nunca** inyectan servicios HTTP directamente; todo dato de API vive en el store.

**Auth:** access token JWT en memoria JS (nunca localStorage/cookie, 15 min), refresh token en
cookie httpOnly `SameSite=Lax` (7 días, rotación automática, scoped a `/api/v1/auth`). Hashing
Argon2id con fallback bcrypt (pwdlib). Payload del JWT: solo `sub=user_id`. Detalle en
`docs/ARCHITECTURE.md` y `docs/SECURITY.md`.

## Estructura

```
backend/app/
  api/routes/   # Routers FastAPI (uno por entidad): auth.py, login.py, users.py, utils.py
  api/deps.py   # SessionDep, CurrentUser, SuperUser
  core/         # config.py (Settings), security.py, db.py
  crud/         # Funciones de acceso a BD
  db/base.py    # Base (DeclarativeBase), TimestampMixin
  models/       # Modelos SQLAlchemy (registrar en models/__init__.py para Alembic)
  schemas/      # Esquemas Pydantic (*Create, *Update, *Public, *sPublic)
  services/     # Lógica de negocio compleja (vacío por ahora)
  alembic/      # env.py, versions/

frontend/src/app/
  core/auth/          # auth.guard.ts, auth.interceptor.ts, refresh.interceptor.ts, auth.service.ts
  core/notifications/ # NotificationService
  features/           # landing (público), auth (login/register), dashboard (requiere auth)
  layouts/            # navbar y demás layout components
  shared/components/  # Toast, modales, reutilizables
  store/Authentication/ # único store existente hoy (feature key "auth")
frontend/src/client/  # generado por ng-openapi — NUNCA editar a mano
```

## Comandos frecuentes

### Docker
```bash
docker compose up -d          # Levantar stack completo
docker compose logs -f backend
docker compose down            # (down -v destruye volúmenes/datos)
```

### Backend (local, sin Docker para el backend)
```bash
docker compose up -d db redis minio   # solo infra
cd backend
uv sync
uv run ruff check .
uv run ruff format .
uv run mypy app
POSTGRES_SERVER=localhost REDIS_HOST=localhost uv run fastapi run --reload app/main.py
```

### Migraciones
```bash
cd backend
POSTGRES_SERVER=localhost uv run alembic revision --autogenerate -m "descripcion"
POSTGRES_SERVER=localhost uv run alembic upgrade head
POSTGRES_SERVER=localhost uv run alembic current    # ver estado
POSTGRES_SERVER=localhost uv run alembic downgrade -1
```

### Frontend (local)
```bash
cd frontend
npm install
npm run start                 # ng serve, proxy /api → localhost:8000, http://localhost:4200
npm run build                 # build de producción
npm run generate:client       # Regenerar cliente HTTP desde OpenAPI (requiere backend en :8000)
```

### Cliente HTTP (raíz del repo)
```bash
bash scripts/generate-client.sh   # equivalente a generate:client, requiere backend corriendo
```

## Tests
Sin suite activa todavía: `backend/tests/` solo tiene `__init__.py`. No asumir cobertura existente.

## Reglas críticas
- **No SQLModel** — SQLAlchemy 2.x puro (`Mapped`, `mapped_column`).
- **No SignalStore** — NgRx clásico (actions, reducer, effects, selectors).
- **Nunca editar `frontend/src/client/`** — se regenera y sobreescribe con `generate:client`.
- **No `<select>` nativo** — usar `ng-select` con `[appendTo]="'body'"`, especialmente en modales.
- **Todo dato de API vive en NgRx Store** — componentes despachan actions y leen via `selectSignal`, la lógica HTTP vive en Effects.
- **Contract-first, flujo vertical obligatorio, sin saltarse pasos:**
  `DB model → Alembic migration → schema Pydantic → CRUD → router FastAPI → regenerar cliente ng-openapi → NgRx store → componente Angular`.
- Password hashing irreversible, nunca loggear passwords/tokens/PII. Ver checklist de seguridad en `docs/SECURITY.md` antes de exponer un endpoint nuevo.

## Diseño / UI
Sistema de diseño y tokens de color/tipografía en `DESIGN.md` (fuente de verdad de estilo visual).
Reglas duras: sin fondos cálidos (crema/arena), sin card grids genéricos, sin gradient text, sin
cards anidadas, sombra ambient siempre presente en cards del dashboard. Contexto de producto y
usuarios en `PRODUCT.md`.

## Dónde mirar según la tarea
| Necesito... | Archivo |
|---|---|
| Setup completo, troubleshooting, variables de entorno | `DEVELOP.md` |
| Arquitectura de sistemas, rutas API/frontend, flujos de auth | `docs/ARCHITECTURE.md` |
| Patrones FastAPI + SQLAlchemy con ejemplos completos | `docs/BACKEND_GUIDE.md` |
| Patrones Angular, NgRx paso a paso, sistema SCSS, convención de botones | `docs/FRONTEND_GUIDE.md` |
| Seguridad, checklist para nuevos endpoints | `docs/SECURITY.md` |
| Integración Google Calendar (DWD, slots, eventos) | `docs/GOOGLE_CALENDAR.md` |
| Despliegue Vercel (frontend) + Railway (backend) | `docs/DEPLOY_VERCEL_RAILWAY.md` |
| Log de decisiones técnicas / hitos de avance | `docs/DECISIONS.md`, `docs/MILESTONES.md` |

## Estado actual
Backend: auth (login/refresh/logout) + CRUD de usuarios. Frontend: landing pública + login +
register + dashboard base. Módulos de negocio del dominio inmobiliario están pendientes de
definir/construir — no asumir que existen entidades más allá de `User`.
