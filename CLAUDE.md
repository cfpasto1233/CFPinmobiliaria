# Cfpasto — Guía para Claude

Este es el archivo canónico de instrucciones para el repo. `AGENTS.md` es un suplemento
compacto de lo que se suele pasar por alto; `docs/*.md` tiene el detalle profundo por área.

## Stack
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.x (sin SQLModel), Alembic, PostgreSQL 17
- **Frontend:** Angular 21 (standalone + Signals + OnPush), NgRx clásico, Bootstrap 5.3, ng-openapi
- **Infra:** Docker Compose, Redis 7 (cache + rate limiting), MinIO (S3), Mailcatcher (SMTP dev)
- **Herramientas:** uv (Python, workspace en `pyproject.toml` root con `members=["backend"]`), **bun** (Node 20+, no npm/yarn)

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
  api/routes/   # Routers FastAPI (uno por entidad): auth.py, login.py, users.py, utils.py,
                # propiedades.py, proyectos.py
  api/deps.py   # SessionDep, CurrentUser, SuperUser
  core/         # config.py (Settings), security.py, db.py
  crud/         # Funciones de acceso a BD
  db/base.py    # Base (DeclarativeBase), TimestampMixin
  models/       # Modelos SQLAlchemy (registrar en models/__init__.py para Alembic)
  schemas/      # Esquemas Pydantic (*Create, *Update, *Public, *sPublic)
  services/     # storage.py (cliente boto3/MinIO; políticas de lectura pública por prefijo:
                # propiedades/*, proyectos/*); resto vacío por ahora
  alembic/      # env.py, versions/

frontend/src/app/
  core/auth/          # auth.guard.ts, auth.interceptor.ts, refresh.interceptor.ts, auth.service.ts
  core/notifications/ # NotificationService
  core/http/           # http-error.util.ts (extrae mensaje de HttpErrorResponse)
  core/whatsapp/        # whatsapp.util.ts (arma links wa.me con mensaje precargado)
  features/           # landing (público, con el menú de búsqueda del hero: Ventas, Arriendos,
                       # Clientes, Proyectos), propiedades (listado público /propiedades),
                       # proyectos (listado público /proyectos, cards tipo propiedades),
                       # ventas / arrendar / arrendar-propiedad / recaudo / reportes (formularios
                       # públicos de captura de leads, solo visuales — sin backend propio, mismo
                       # patrón de card navy/naranja del hero),
                       # auth (login/register), dashboard, design-system,
                       # admin/propiedades (CRUD superadmin: propiedades-list, propiedad-form,
                       # propiedad-upload.service.ts),
                       # admin/proyectos (CRUD superadmin: proyectos-list, proyecto-form,
                       # proyecto-upload.service.ts — mismo patrón que admin/propiedades pero con
                       # una sola foto de portada, sin galería adicional)
  layouts/            # navbar, footer, admin-layout (shell /admin), sidebar, topbar
                       # (sidebar y topbar son componentes propios, usados por admin-layout)
  shared/components/  # toast-container, property-card, property-gallery-modal, project-card,
                       # reutilizables
  store/Authentication/ # feature key "auth"
  store/Propiedades/    # feature key "propiedades" — compartido entre landing/propiedades y admin
  store/Proyectos/      # feature key "proyectos" — compartido entre landing/proyectos y admin
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
uv run mypy app                        # mypy no-strict; ruff line-length=100, E501 ignorado (ver pyproject.toml)
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
bun install
bun run start                 # ng serve, proxy /api → localhost:8000, http://localhost:4200
bun run build                 # build de producción
bun run generate:client       # Regenerar cliente HTTP desde OpenAPI (requiere backend en :8000)
```

### Cliente HTTP (raíz del repo)
```bash
bash scripts/generate-client.sh   # equivalente a generate:client, requiere backend corriendo
```

## Tests
Sin suite activa todavía: `backend/tests/` solo tiene `__init__.py` y `frontend/` no tiene ningún
`*.spec.ts`. No asumir cobertura existente.

## Ramas
`main` (producción) ← `develop` (integración) ← `feature/*` / `hotfix/*`. Los PRs de feature van
contra `develop`, no contra `main`.

## Reglas críticas
- **No SQLModel** — SQLAlchemy 2.x puro (`Mapped`, `mapped_column`).
- **No SignalStore** — NgRx clásico (actions, reducer, effects, selectors).
- **Nunca editar `frontend/src/client/`** — se regenera y sobreescribe con `generate:client`. Está
  en `.gitignore` (no se comitea): cualquier cambio de contrato backend debe terminar con el
  cliente regenerado localmente (`bun run generate:client`) antes de levantar el frontend, pero
  esos archivos no van al repo.
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
Backend: auth (login/refresh/logout) + CRUD de usuarios + CRUD de propiedades + CRUD de proyectos
(lectura pública, escritura superadmin, fotos en MinIO vía `app/services/storage.py`). Entidades de
negocio existentes: `User`, `Propiedad`/`PropiedadFoto`, `Proyecto` (una sola foto de portada, sin
tabla de fotos adicionales — más simple que Propiedad a propósito). No asumir que existen más.
Frontend: landing pública (conectada a `/api/v1/propiedades` y `/api/v1/proyectos` reales) + página
de listado público completo en `/propiedades` y `/proyectos` (`features/propiedades`,
`features/proyectos`) + formularios públicos de captura de leads sin backend propio (`/ventas`,
`/arrendar`, `/arrendar-propiedad`, `/recaudo`, `/reportes` — enlazados desde el menú de búsqueda
del hero) + contacto vía WhatsApp (`core/whatsapp/whatsapp.util.ts`, usado en landing y navbar) +
login/register + dashboard + `features/design-system` (showcase de componentes UI). El área
superadmin (`layouts/admin-layout`, ruta `/admin`, con `layouts/sidebar` y `layouts/topbar` como
componentes propios) tiene los módulos "Propiedades" y "Proyectos" (`features/admin/propiedades`,
`features/admin/proyectos`, stores `store/Propiedades` y `store/Proyectos`). El upload de fotos usa
un servicio manual con `HttpClient`/`FormData` (`propiedad-upload.service.ts`,
`proyecto-upload.service.ts`) porque el cliente ng-openapi generado no arma bien el body multipart;
el resto de operaciones (list/get/update/delete) sí usan el cliente generado. Módulos de negocio
adicionales del dominio inmobiliario siguen pendientes de definir/construir.
