# Cfpasto — Guía para Claude

## Stack
- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL 17
- **Frontend:** Angular 21 (standalone + signals), NgRx, Bootstrap 5, ng-openapi
- **Infra:** Docker Compose, Redis 7, MinIO, Mailcatcher
- **Herramientas:** uv (Python), Bun (Node)

## Estructura
```
backend/app/
  api/routes/   # Routers FastAPI (uno por entidad)
  core/         # config.py, security.py, db.py
  crud/         # Funciones de acceso a BD
  db/           # Base, TimestampMixin
  models/       # Modelos SQLAlchemy
  schemas/      # Esquemas Pydantic
  services/     # Lógica de negocio

frontend/src/app/
  core/         # Guards, interceptores, servicios base
  features/     # Módulos de negocio (landing, auth, dashboard)
  shared/       # Componentes reutilizables
  store/        # NgRx (actions, reducers, effects, selectors)
```

## Comandos frecuentes

### Docker
```bash
docker compose up -d          # Levantar stack
docker compose logs -f backend
docker compose down
```

### Backend (local)
```bash
cd backend
uv sync
alembic upgrade head
fastapi run --reload app/main.py --port 8000
```

### Migraciones
```bash
cd backend
alembic revision --autogenerate -m "descripcion"
alembic upgrade head
```

### Frontend (local)
```bash
cd frontend
bun install
bun run start                 # http://localhost:4200
bun run generate:client       # Regenerar cliente HTTP desde OpenAPI
```

## Flujo para nueva feature
1. Crear modelo en `backend/app/models/`
2. `alembic revision --autogenerate` + `upgrade head`
3. Crear schema Pydantic en `backend/app/schemas/`
4. Crear CRUD en `backend/app/crud/`
5. Crear router en `backend/app/api/routes/` + registrar en `api/main.py`
6. Regenerar cliente: `bun run generate:client`
7. Crear NgRx store (actions → reducer → effects → selectors)
8. Crear componente Angular en `features/<modulo>/`
