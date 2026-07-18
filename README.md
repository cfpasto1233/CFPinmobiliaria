# Cfpasto

Plataforma web de gestión para Cfpasto.

## Stack Tecnológico

- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.x, Alembic, PostgreSQL 17
- **Frontend**: Angular 21 (standalone + signals), NgRx 21, Bootstrap 5.3
- **Infraestructura**: Docker Compose, Redis 7, MinIO, Mailcatcher
- **Herramientas**: uv (Python), Node.js 20+ (frontend)

## Inicio rápido

```bash
# 1. Configurar entorno
cp .env.example .env
# Editar .env con tus valores

# 2. Generar uv.lock
uv sync

# 3. Instalar dependencias frontend
cd frontend && npm install && cd ..

# 4. Levantar stack
docker compose build
docker compose up -d

# 5. Generar cliente HTTP (requiere backend corriendo ~30s)
bash scripts/generate-client.sh
```

Ver [DEVELOP.md](DEVELOP.md) para instrucciones completas.

## Estructura del proyecto

```
Cfpasto/
├── backend/              # API FastAPI (Python 3.12)
│   ├── app/
│   │   ├── api/          # Rutas y endpoints
│   │   ├── core/         # Config, seguridad, DB
│   │   ├── crud/         # Acceso a datos
│   │   ├── db/           # Base + TimestampMixin
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── schemas/      # Esquemas Pydantic
│   │   ├── services/     # Lógica de negocio
│   │   └── alembic/      # Migraciones
│   ├── scripts/          # prestart.sh, start.sh
│   └── Dockerfile
│
├── frontend/             # App Angular 21
│   ├── src/app/
│   │   ├── core/         # Guards, interceptores, servicios base
│   │   ├── features/     # Módulos de negocio
│   │   ├── shared/       # Componentes reutilizables
│   │   └── store/        # NgRx state management
│   ├── src/client/       # Cliente HTTP generado (no editar)
│   └── Dockerfile
│
├── docs/                 # Documentación técnica
├── scripts/              # generate-client.sh
├── compose.yml           # Orquestación Docker
├── compose.override.yml  # Puertos locales
├── .env.example          # Variables de referencia
├── CLAUDE.md             # Guía para Claude Code
├── DESIGN.md             # Sistema de diseño
├── DEVELOP.md            # Guía de desarrollo
├── PRODUCT.md            # Contexto del producto
└── AGENTS.md             # Referencia rápida para agentes IA
```

## Estructura de ramas (Git)

```
main         → Código estable (producción)
develop      → Rama de integración (sprints)
feature/*    → Nuevas funcionalidades (ej. feature/modulo-clientes)
hotfix/*     → Correcciones críticas en producción
```

### Flujo de trabajo

```bash
# 1. Sincronizar con develop
git checkout develop && git pull origin develop

# 2. Crear rama de feature
git checkout -b feature/nombre-feature

# 3. Commits atómicos
git commit -m "feat: descripción de la funcionalidad"

# 4. Pull Request hacia develop
git push origin feature/nombre-feature
```

## Servicios locales

| Servicio | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| MinIO Console | http://localhost:9001 |
| Mailcatcher | http://localhost:1080 |

## Documentación

| Documento | Propósito |
|---|---|
| [DEVELOP.md](DEVELOP.md) | Setup, comandos y flujo de desarrollo |
| [DESIGN.md](DESIGN.md) | Sistema de diseño y componentes UI |
| [PRODUCT.md](PRODUCT.md) | Contexto del producto y usuarios |
| [AGENTS.md](AGENTS.md) | Referencia rápida para agentes IA |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura de sistemas |
| [docs/BACKEND_GUIDE.md](docs/BACKEND_GUIDE.md) | Guía de patrones backend |
| [docs/FRONTEND_GUIDE.md](docs/FRONTEND_GUIDE.md) | Guía de patrones frontend |
| [docs/SECURITY.md](docs/SECURITY.md) | Seguridad y credenciales |
| [docs/GOOGLE_CALENDAR.md](docs/GOOGLE_CALENDAR.md) | Integración Google Calendar |
| [docs/DEPLOY_VERCEL_RAILWAY.md](docs/DEPLOY_VERCEL_RAILWAY.md) | Despliegue Vercel + Railway |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Log de decisiones técnicas |
| [docs/MILESTONES.md](docs/MILESTONES.md) | Hitos y estado de avance |
