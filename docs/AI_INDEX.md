# AI_INDEX — Cfpasto

## Propósito del proyecto

[Completar con la descripción del dominio y propósito real de Cfpasto]

Plataforma de gestión web para Cfpasto. Permite [funcionalidades principales].

## Documentos clave

| Documento | Propósito |
|---|---|
| `CLAUDE.md` | Instrucciones y reglas para Claude Code |
| `docs/ARCHITECTURE.md` | Componentes y flujos de la plataforma |
| `docs/DECISIONS.md` | Registro de decisiones técnicas |
| `docs/MILESTONES.md` | Incrementos y estado de avance |
| `docs/BACKEND_GUIDE.md` | Patrones FastAPI + SQLAlchemy |
| `docs/FRONTEND_GUIDE.md` | Patrones Angular + ng-openapi + estilos |
| `docs/SECURITY.md` | Seguridad y manejo de credenciales |
| `docs/GOOGLE_CALENDAR.md` | Integración Google Calendar (DWD, slots, crear eventos) |
| `docs/DEPLOY_VERCEL_RAILWAY.md` | Despliegue frontend en Vercel + backend en Railway |

## Reglas globales

1. Branch principal: `main`; integración en `develop`
2. SQLAlchemy 2.x + Alembic (NO SQLModel)
3. Angular 21 standalone + Signals + OnPush
4. Contract-first (DB → API → OpenAPI → ng-openapi → frontend)
5. Flujo vertical: DB → API → OpenAPI → cliente → UI
6. NgRx clásico (actions, reducer, effects, selectors) — sin SignalStore
7. Nunca editar `frontend/src/client/` — es generado automáticamente

## Estado inicial (2026-07-15)

- Backend: endpoints de auth (login, refresh, logout) + CRUD de usuarios
- Frontend: landing pública + login + register + dashboard base
- Pendiente: módulos de negocio del proyecto (definir con el equipo)
