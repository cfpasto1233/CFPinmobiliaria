# AGENTS.md

Read `CLAUDE.md` first — es el archivo canónico de instrucciones. Este archivo es un suplemento compacto de lo que los agentes suelen pasar por alto.

## Stack en 10 palabras

**Backend**: FastAPI + SQLAlchemy 2.x + Alembic + PostgreSQL + Redis + MinIO. **Frontend**: Angular 21 standalone + NgRx + Signals + Bootstrap 5.3.

## Toolchain quirks

| Expectation | Reality |
|---|---|
| Python package manager | `uv` (not pip, not poetry) — root `pyproject.toml` es un UV workspace con `members = ["backend"]` |
| Node package manager | `bun` con Node 20+ (no npm/yarn) |
| Lockfiles | `bun.lock` (raíz, cubre el workspace `frontend`), `uv.lock` (backend, también en root) |
| Test suite | Sin tests activos aún. Backend: `tests/` está vacío. |

## Comandos (exactos, no obvios)

```bash
# Frontend (dentro de frontend/)
bun install
bun run start              # ng serve, proxy /api → localhost:8000
bun run build              # production build
bun run generate:client    # regenerar cliente ng-openapi

# Backend (dentro de backend/)
uv sync
uv run ruff check .
uv run ruff format .
uv run mypy app
uv run alembic revision --autogenerate -m "descripcion"
POSTGRES_SERVER=localhost uv run alembic upgrade head

# Client regeneration (requiere backend en :8000)
bash scripts/generate-client.sh

# Docker — solo infra, backend en host
docker compose up -d db redis minio
POSTGRES_SERVER=localhost REDIS_HOST=localhost \
  uv run fastapi run --reload app/main.py
```

## Reglas críticas

- **Nunca editar** `frontend/src/client/` — auto-generado por ng-openapi, se sobreescribe en cada regeneración.
- **No SQLModel** — SQLAlchemy 2.x puro (`Mapped`, `mapped_column`).
- **No SignalStore** — NgRx clásico (actions, reducer, effects, selectors).
- **No `<select>` nativo** — usar `ng-select` con `[appendTo]="'body'"` en modales.
- **Todos los datos de API en NgRx Store** — los componentes despachan actions y leen via `selectSignal`. Nunca inyectar servicios HTTP directamente en componentes.
- **Contract-first**: DB migration → FastAPI endpoint → regenerar ng-openapi client → UI.

## Architecture shortcuts

| Fuente | Qué contiene |
|---|---|
| `CLAUDE.md` | Instrucciones completas: flujo auth, NgRx stores, guards, patrones de componentes, SCSS, convenciones de botones |
| `docs/ARCHITECTURE.md` | Stack, rutas API, flujos de auth |
| `docs/BACKEND_GUIDE.md` | Patrones FastAPI + SQLAlchemy |
| `docs/FRONTEND_GUIDE.md` | Angular + ng-openapi + estilos |
| `docs/SECURITY.md` | Seguridad y manejo de credenciales |
| `docs/DEPLOY_VERCEL_RAILWAY.md` | Despliegue Vercel + Railway paso a paso |
| `docs/DECISIONS.md` | Log de decisiones técnicas |

## NgRx: el reset trap

Si se añade un `resetOnLogout` metaReducer (patrón de CirculaWeb), limpia TODOS los slices en `AuthActions.logout`. Los nuevos slices no necesitan manejar el logout por separado.

## Flujo vertical obligatorio

```
DB model → Alembic migration → FastAPI schema + CRUD + router
  → regenerate ng-openapi client
  → NgRx store (actions → reducer → effects → selectors)
  → Angular component
```

Nunca saltarse pasos. Nunca editar el cliente generado.
