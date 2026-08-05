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

## 2026-08-01 — Calendario propio de citas en vez de integración con Google Calendar

**Decisión:** Se descarta la integración con Google Calendar (Domain-Wide Delegation + Service
Account) documentada en `docs/GOOGLE_CALENDAR.md` y se construye en su lugar un módulo propio de
citas dentro de la plataforma (`Cita`, `features/admin/citas`, `store/Citas`) con calendario visual
(mes/semana/día) para que el superadmin gestione citas manualmente.

**Contexto:** La integración con Google Calendar nunca se implementó — quedó solo como diseño
documental y un setting vacío (`GOOGLE_SERVICE_ACCOUNT_JSON`), sin código real. Evita depender de
Google Workspace Admin para Domain-Wide Delegation y mantiene el control del agendamiento dentro de
la plataforma.

**Alcance de esta fase:** Solo gestión manual por el superadmin (crear/editar/mover/cancelar citas
desde el calendario, con vínculo opcional a una `SolicitudVenta` o `SolicitudArriendo`). El
agendamiento automático desde los formularios públicos del landing según disponibilidad queda
pendiente de definir — no se decidió aún qué formularios lo permitirán.

**Consecuencias:** Se eliminó `docs/GOOGLE_CALENDAR.md` y el setting `GOOGLE_SERVICE_ACCOUNT_JSON`
de `config.py`/`.env.example`. La librería `angular-calendar` (+ `angular-draggable-droppable`,
`angular-resizable-element`, `date-fns`) se agregó al frontend para las vistas de calendario.

<!-- Agregar nuevas decisiones aquí conforme evolucione el proyecto -->
<!-- Formato: ## YYYY-MM-DD — Título -->
