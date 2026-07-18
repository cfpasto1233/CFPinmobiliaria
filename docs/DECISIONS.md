# Decisiones Técnicas — Cfpasto

Log de decisiones técnicas significativas tomadas en el proyecto.
Formato: `YYYY-MM-DD — Título de la decisión`

---

## 2026-07-15 — Stack tecnológico inicial

**Decisión:** Angular 21 + FastAPI + PostgreSQL + Docker Compose, con Redis, MinIO y Mailcatcher como servicios auxiliares.

**Contexto:** Se replicó la misma arquitectura y metodología del proyecto CirculaWeb (`D:\Udenar\Pasantía\Circula\CirculaWeb`) para mantener consistencia de patrones y reducir curva de aprendizaje.

**Alternativas descartadas:**
- Django: mayor overhead para APIs simples
- Next.js/React: el equipo tiene más experiencia en Angular
- SQLModel: se prefiere SQLAlchemy 2.x puro por más control

---

## 2026-07-15 — Autenticación con JWT en memoria + refresh en cookie

**Decisión:** Access token en memoria JS (15 min), refresh token en httpOnly cookie (7 días).

**Contexto:** Patron probado en CirculaWeb. Evita vulnerabilidades XSS al no persistir el access token en localStorage. La cookie httpOnly protege el refresh token de scripts maliciosos.

**Consecuencias:**
- Al recargar la página, el access token se pierde → `App.ts` despacha `AuthActions.refreshToken()` en constructor para recuperar la sesión automáticamente.
- El frontend siempre inicia con `initialized: false` hasta completar el primer refresh.

---

## 2026-07-15 — ng-openapi para cliente HTTP generado

**Decisión:** Usar `ng-openapi-gen` para generar automáticamente los servicios Angular desde el schema OpenAPI del backend.

**Contexto:** Elimina la necesidad de mantener clientes HTTP manualmente. Cuando el backend cambia un schema, se regenera el cliente y TypeScript detecta los errores en compilación.

**Regla derivada:** Nunca editar `frontend/src/client/` manualmente. Todo cambio se hace en el backend (schema Pydantic) y se regenera.

---

## 2026-07-15 — NgRx clásico (no SignalStore)

**Decisión:** Usar NgRx con actions, reducer, effects y selectors clásicos. No usar `@ngrx/signals` (SignalStore).

**Contexto:** NgRx clásico tiene mejor soporte de DevTools (time-travel debugging), más documentación, y es el patrón establecido en CirculaWeb. SignalStore es más nuevo y menos maduro.

**Regla derivada:** Estado local de UI (toggles, modales) → `signal()` local en componente. Estado de datos de API → NgRx store.

---

<!-- Agregar nuevas decisiones aquí conforme evolucione el proyecto -->
<!-- Formato: ## YYYY-MM-DD — Título -->
