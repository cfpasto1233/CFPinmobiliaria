# Milestones — Cfpasto

Estado de avance del proyecto por hitos. Actualizar conforme se completen features.

**Leyenda:** ✅ Completo · 🔄 En progreso · ⬜ Pendiente

---

## M0 — Estructura base (2026-07-15)

Scaffolding completo del proyecto. Sin funcionalidad de negocio, pero toda la infraestructura operativa.

### Backend
- ✅ Proyecto FastAPI configurado con pydantic-settings
- ✅ Conexión a PostgreSQL con SQLAlchemy 2.x
- ✅ Modelo User con TimestampMixin
- ✅ CRUD de usuarios (create, update, get_by_email, authenticate)
- ✅ Autenticación JWT (access token en respuesta, refresh token en cookie httpOnly)
- ✅ Endpoints: login, auth/refresh, auth/logout
- ✅ CRUD de usuarios (solo superuser)
- ✅ Health check endpoint
- ✅ Alembic configurado con env.py
- ✅ Middleware de seguridad (headers)
- ✅ CORS configurado
- ✅ Dockerfile + scripts prestart/start
- ✅ Superusuario inicial en initial_data.py

### Frontend
- ✅ Angular 21 configurado (standalone, OnPush, signals)
- ✅ NgRx store (Authentication: actions, reducer, effects, selectors)
- ✅ Interceptor de auth (Bearer token)
- ✅ Interceptor de refresh (401 → logout)
- ✅ Auth guard
- ✅ Auth service (signals reactivos)
- ✅ NotificationService (toasts)
- ✅ Toast container component
- ✅ Landing básica
- ✅ Login component + template
- ✅ Register component
- ✅ Dashboard básico
- ✅ app.routes.ts con lazy loading
- ✅ app.config.ts con providers
- ✅ Proxy dev configurado
- ✅ Dockerfile multi-stage (nginx)

### Infra
- ✅ Docker Compose con todos los servicios (db, redis, minio, mailcatcher, prestart, backend, frontend)
- ✅ compose.override.yml con puertos locales
- ✅ .env + .env.example
- ✅ scripts/generate-client.sh

### Docs
- ✅ CLAUDE.md
- ✅ DESIGN.md
- ✅ DEVELOP.md
- ✅ PRODUCT.md
- ✅ AGENTS.md
- ✅ README.md
- ✅ docs/AI_INDEX.md
- ✅ docs/ARCHITECTURE.md
- ✅ docs/BACKEND_GUIDE.md
- ✅ docs/FRONTEND_GUIDE.md
- ✅ docs/SECURITY.md
- ✅ docs/DECISIONS.md
- ✅ docs/MILESTONES.md
- ~~✅ docs/GOOGLE_CALENDAR.md~~ (descartado, ver docs/DECISIONS.md — reemplazado por el módulo de Citas)
- ✅ docs/DEPLOY_VERCEL_RAILWAY.md

---

## M0.5 — Cliente HTTP generado + Auth funcional

Conectar el frontend real con el backend via cliente ng-openapi. Login/logout funcionando end-to-end.

### Backend
- ⬜ Verificar que OpenAPI schema es correcto y completo
- ⬜ Ajustar schemas de respuesta si es necesario

### Frontend
- ⬜ Ejecutar `generate-client.sh` con backend corriendo
- ⬜ Conectar `AuthenticationEffects.login$` con `LoginService` generado
- ⬜ Conectar `AuthenticationEffects.refreshToken$` con `AuthService` generado
- ⬜ Conectar `AuthenticationEffects.loadCurrentUser$` con `UsersService` generado
- ⬜ Implementar login end-to-end (formulario → token → perfil → redirect)
- ⬜ Implementar logout end-to-end

### Verificación
- ⬜ Login con superusuario funciona
- ⬜ Redirect a /dashboard tras login
- ⬜ Refresh automático al recargar la página
- ⬜ Logout elimina sesión y redirige a /auth/login
- ⬜ Guard bloquea /dashboard sin auth

---

## M1 — [Primer módulo de negocio]

*Definir con el equipo el primer módulo funcional del proyecto.*

### Backend
- ⬜ Definir entidades del módulo
- ⬜ Crear modelos SQLAlchemy
- ⬜ Generar migración Alembic
- ⬜ Crear schemas Pydantic
- ⬜ Crear CRUD functions
- ⬜ Crear router y endpoints
- ⬜ Registrar en api/main.py

### Frontend
- ⬜ Regenerar cliente HTTP
- ⬜ Crear NgRx store del módulo
- ⬜ Crear componentes de lista
- ⬜ Crear formulario de creación/edición
- ⬜ Agregar ruta en app.routes.ts
- ⬜ Agregar ítem de menú en layout/sidebar

---

<!-- Agregar nuevos milestones conforme se definan -->
