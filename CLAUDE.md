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
                # propiedades.py, proyectos.py, campanas.py, citas.py, solicitudes_venta.py,
                # solicitudes_arriendo.py, solicitudes_arrendar_propiedad.py, reportes_dano.py,
                # solicitudes_publicar_propiedad.py, solicitudes_documentos_propietario.py
  api/deps.py   # SessionDep, CurrentUser, SuperUser
  core/         # config.py (Settings), security.py, db.py
  crud/         # Funciones de acceso a BD
  db/base.py    # Base (DeclarativeBase), TimestampMixin
  models/       # Modelos SQLAlchemy (registrar en models/__init__.py para Alembic)
  schemas/      # Esquemas Pydantic (*Create, *Update, *Public, *sPublic)
  services/     # storage.py (cliente boto3/MinIO; políticas de lectura pública por prefijo:
                # propiedades/*, proyectos/*; reportes-dano/* queda privado a propósito, sin
                # panel de admin que necesite mostrarlo); purga_solicitudes.py; recaudo_slots.py
  alembic/      # env.py, versions/

frontend/src/app/
  core/auth/          # auth.guard.ts, auth.interceptor.ts, refresh.interceptor.ts, auth.service.ts
  core/notifications/ # NotificationService
  core/http/           # http-error.util.ts (extrae mensaje de HttpErrorResponse)
  core/whatsapp/        # whatsapp.util.ts (arma links wa.me con mensaje precargado)
  features/           # landing (público, con el menú de búsqueda del hero: Ventas, Arriendos,
                       # Clientes, Proyectos), propiedades (listado público /propiedades),
                       # proyectos (listado público /proyectos, cards tipo propiedades),
                       # ventas, arrendar y arrendar-propiedad (formularios públicos de captura de
                       # leads, conectados a /api/v1/solicitudes-venta,
                       # /api/v1/solicitudes-arriendo y /api/v1/solicitudes-arrendar-propiedad
                       # reales — arrendar-propiedad es "quiero que CFP arriende mi propiedad",
                       # propietario que busca que CFP administre/arriende su inmueble, distinto de
                       # arrendar que es el inquilino buscando propiedad),
                       # recaudo (agenda visitas de recaudo del canon de arrendamiento — calendario
                       # público con reglas de disponibilidad por día del mes/día de la semana,
                       # crea una `Cita` real via /api/v1/citas/recaudo*, visible en
                       # /admin/citas — no usa una tabla de solicitud propia) /
                       # reportes ("Reportes de daños" — formulario público real conectado a
                       # /api/v1/reportes-dano, tema claro igual a arrendar-propiedad, hasta 5
                       # fotos opcionales, con vista de admin en admin/reportes-dano, ver detalle
                       # en Estado actual),
                       # auth (login/register), dashboard, design-system,
                       # admin/propiedades (CRUD superadmin: propiedades-list, propiedad-form,
                       # propiedad-upload.service.ts),
                       # admin/proyectos (CRUD superadmin: proyectos-list, proyecto-form,
                       # proyecto-upload.service.ts — mismo patrón que admin/propiedades pero con
                       # una sola foto de portada, sin galería adicional),
                       # admin/campana (formulario superadmin para configurar la campaña activa
                       # de la landing — sin listado, un solo registro), admin/citas (calendario
                       # superadmin de citas — vistas mes/semana/día con angular-calendar,
                       # crear/editar/mover/cancelar citas manualmente, con vínculo opcional a una
                       # SolicitudVenta o SolicitudArriendo; el agendamiento automático desde los
                       # formularios públicos del landing queda pendiente de definir),
                       # admin/solicitudes-venta, admin/solicitudes-arriendo,
                       # admin/solicitudes-arrendar-propiedad y admin/solicitudes-publicar-propiedad
                       # (listado + modal de detalle de leads capturados por los formularios
                       # públicos de /ventas, /arrendar, /arrendar-propiedad y /publicar-propiedad,
                       # superadmin), admin/reportes-dano (mismo patrón listado + modal de detalle,
                       # con las fotos del reporte cargadas vía URLs firmadas al abrir el modal),
                       # admin/solicitudes-documentos-propietario (mismo patrón listado + modal de
                       # detalle, con botón "Validar documentos" que genera el link de
                       # /publicar-mi-propiedad/:token, ver Estado actual),
                       # publicar-mi-propiedad (página pública que consume ese token para publicar
                       # una Propiedad directamente, ver Estado actual)
  layouts/            # navbar, footer, admin-layout (shell /admin), sidebar, topbar
                       # (sidebar y topbar son componentes propios, usados por admin-layout)
  shared/components/  # toast-container, property-card, property-gallery-modal, project-card,
                       # publicar-whatsapp-fab, reutilizables
  store/Authentication/   # feature key "auth"
  store/Propiedades/      # feature key "propiedades" — compartido entre landing/propiedades y admin
  store/Proyectos/        # feature key "proyectos" — compartido entre landing/proyectos y admin
  store/Campana/          # feature key "campana"
  store/Citas/            # feature key "citas"
  store/SolicitudesVenta/    # feature key "solicitudesVenta"
  store/SolicitudesArriendo/ # feature key "solicitudesArriendo"
  store/SolicitudesArrendarPropiedad/ # feature key "solicitudesArrendarPropiedad"
  store/SolicitudesPublicarPropiedad/ # feature key "solicitudesPublicarPropiedad"
  store/ReportesDano/     # feature key "reportesDano" — create (formulario público), load
                          # (listado admin/reportes-dano) y loadFotos (URLs firmadas, compartido
                          # por la página pública /reportes/:id/fotos y el modal de detalle admin)
  store/SolicitudesDocumentosPropietario/ # feature key "solicitudesDocumentosPropietario" — ver
                          # flujo completo al final de "Estado actual"
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
No hay `lint`/`format` configurado en `frontend/package.json` (a diferencia de ruff en backend) — no asumir que existe.

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
| Despliegue Vercel (frontend) + Railway (backend) | `docs/DEPLOY_VERCEL_RAILWAY.md` |
| Log de decisiones técnicas / hitos de avance | `docs/DECISIONS.md`, `docs/MILESTONES.md` |

## Estado actual
Backend: auth (login/refresh/logout) + CRUD de usuarios + CRUD de propiedades + CRUD de proyectos +
CRUD de campañas + CRUD de citas + CRUD de solicitudes de venta + CRUD de solicitudes de arriendo +
CRUD de solicitudes de arrendar-propiedad + CRUD de solicitudes de publicar-propiedad (lectura
pública en propiedades/proyectos, escritura superadmin, fotos en MinIO vía
`app/services/storage.py`). Entidades de negocio existentes: `User`,
`Propiedad`/`PropiedadFoto`, `Proyecto` (una sola foto de portada, sin tabla de fotos adicionales —
más simple que Propiedad a propósito), `Campana` (campaña activa mostrada en la landing — un solo
registro, sin fotos), `Cita` (citas gestionadas por el superadmin, con estado
`pendiente`/`confirmada`/`cancelada`/`completada` y vínculo opcional a una `SolicitudVenta` o
`SolicitudArriendo` vía FK nullable), `SolicitudVenta` (leads del formulario público `/ventas`),
`SolicitudArriendo` (leads del formulario público `/arrendar`, inquilino buscando propiedad),
`SolicitudArrendarPropiedad` (leads del formulario público `/arrendar-propiedad`, propietario que
quiere que CFP le arriende/administre su inmueble), `SolicitudPublicarPropiedad` (leads del
formulario público `/publicar-propiedad`, propietario que quiere que CFP publique/gestione la venta
de su inmueble — solo texto: nombre, medio de comunicación, contacto, dirección, precio estimado,
características, observaciones, todos opcionales salvo nombre/contacto/dirección), `ReporteDano`
(reportes de daños del formulario
público `/reportes` — tubería, techo, estructura, instalación eléctrica, humedad u "otros" con texto
libre — con hasta 5 fotos opcionales). Las solicitudes de texto (venta, arriendo,
arrendar-propiedad, publicar-propiedad) son solo texto salvo `ReporteDano`, que guarda las fotos
como un `ARRAY(String)` de *keys* de MinIO directamente en la fila (no una tabla hija tipo
`PropiedadFoto`: no hay panel de admin que necesite reordenarlas/reemplazarlas una a una).
No asumir que existen más entidades (aparte de `SolicitudDocumentoPropietario`, ver nota al final
de esta sección). Esas cinco tablas de solicitudes (`solicitudes_venta`, `solicitudes_arriendo`,
`solicitudes_arrendar_propiedad`, `solicitudes_publicar_propiedad`, `reportes_dano`) se purgan
automáticamente: una tarea en background dentro del proceso backend (`app/main.py`, arrancada en el
`lifespan`) borra cada `SOLICITUDES_RETENTION_DIAS` (15 por defecto, `core/config.py`) los registros
con `created_at` más viejo que ese umbral, usando un lock diario en Redis (`core/redis.py`) para que
no se ejecute por duplicado con `--workers 2`; la lógica de borrado vive en
`app/services/purga_solicitudes.py`. Para `reportes_dano` la purga también borra las fotos
asociadas en MinIO antes de borrar las filas (`crud/reporte_dano.py::delete_reportes_dano_antiguos`)
para no dejar objetos huérfanos en el bucket.
`POST /api/v1/reportes-dano/` combina "sin auth" + subida de archivos (multipart, hasta 5 fotos
vía `Form()`/`File()` igual que `POST /propiedades/`, sin `SuperUser`). El `id` del reporte lo
manda el propio cliente en el `Form()` (`crypto.randomUUID()` del navegador, ver más abajo el
porqué) en vez de dejar que la fila lo genere — `crud/reporte_dano.py::create_reporte_dano` lo
recibe explícito y el router atrapa una eventual colisión de `IntegrityError` como 409 (en la
práctica, nunca pasa con UUIDs de verdad). `GET /api/v1/reportes-dano/` sí exige `SuperUser`
(listado para `/admin/reportes-dano`, mismo patrón `data`/`count` que el resto de solicitudes).
`GET /api/v1/reportes-dano/{id}/fotos` es público (por UUID no adivinable, mismo modelo que
`GET /api/v1/propiedades/{id}`) y devuelve **solo** URLs firmadas de MinIO válidas 24h
(`storage.py::presigned_url(key, expires_in=86400)`, generadas al vuelo en cada request — nunca
se guardan) para ese reporte puntual; nunca nombre/contacto/descripción. Esas 24h son solo la
frescura de la URL firmada, no una expiración real del link: la página pública sigue funcionando
mientras el reporte exista en la base de datos (hasta los 15 días de purga), cada visita pide
URLs nuevas. Este mismo endpoint público lo consumen dos cosas distintas: la página pública
`/reportes/:id/fotos` (`features/reportes/reporte-dano-fotos/`, con
`<meta name="robots" content="noindex, nofollow">`, enlazada desde el mensaje de WhatsApp) y el
modal de detalle del panel admin (`ReporteDanoDetalleModalComponent`, que despacha
`loadFotos({id})` al abrir si el reporte tiene fotos) — ambos reusan la misma action/effect/
selector de `store/ReportesDano`, no hay dos mecanismos separados. `presigned_url()` usa un
cliente boto3 propio apuntando a `MINIO_PUBLIC_URL` (no al `MINIO_ENDPOINT` interno de Docker que
usa el resto de `storage.py`) — firmar no hace ninguna llamada de red, pero el host firmado sí
tiene que ser uno alcanzable desde el navegador.
`/recaudo` no usa una tabla de solicitud propia: agenda una visita de recaudo del canon de
arrendamiento creando directamente una `Cita` (misma entidad que gestiona el superadmin en
`/admin/citas`), vía dos endpoints públicos en `api/routes/citas.py` (`GET
/api/v1/citas/recaudo/disponibilidad`, `POST /api/v1/citas/recaudo`) — el resto de endpoints de
`citas.py` sigue exigiendo `SuperUser`. La lógica de reglas de horario (colores
verde/amarillo/no_disponible por día del mes, franjas horarias lunes-sábado, anticipación mínima)
vive en `app/services/recaudo_slots.py`, siempre en zona horaria `America/Bogota` (`zoneinfo`, sin
que el backend confíe en el reloj del navegador del visitante); la detección de conflictos de
horario reusa `crud/cita.py::list_citas_por_rango` (no existe otro mecanismo de anti-solapamiento en
el proyecto, ni para el superadmin).
Frontend: landing pública (conectada a `/api/v1/propiedades` y `/api/v1/proyectos` reales) + página
de listado público completo en `/propiedades` y `/proyectos` (`features/propiedades`,
`features/proyectos`) + formularios públicos de captura de leads (`/ventas`, `/arrendar` y
`/arrendar-propiedad` conectados a `/api/v1/solicitudes-venta`, `/api/v1/solicitudes-arriendo` y
`/api/v1/solicitudes-arrendar-propiedad` reales; `/recaudo` conectado a `/api/v1/citas/recaudo*`
—incluye un mini-calendario propio en `features/recaudo` que consume/extiende `store/Citas`, no un
store nuevo—; `/reportes` ("Reportes de daños") conectado a `/api/v1/reportes-dano`, con selector de
hasta 5 fotos (`URL.createObjectURL` para thumbnails, sin subida real hasta el submit). Al enviar,
`reportes.component.ts::onSubmit()` abre `wa.me` **siempre de inmediato y síncrono**, dentro del
mismo clic — sin fotos manda solo el resumen de texto; con fotos, agrega un link a
`/reportes/:id/fotos`. Se probaron dos mecanismos previos para esto que terminaron retirados por
poco confiables: la Web Share API del navegador (`navigator.share`/`canShare`, que podía lanzar
en vez de devolver `false` en algunos navegadores de escritorio) y, después, esperar la respuesta
del backend antes de abrir `wa.me` (el `window.open()` llamado *después* de un `fetch` ya no
cuenta como gesto del usuario y el navegador lo bloquea como pop-up en silencio). La solución
final: el **id lo genera el navegador** (`crypto.randomUUID()`) antes de mandar el formulario, así
se conoce de entrada y el link se arma sin esperar nada — el componente vuelve a ser 100% síncrono
y solo despacha `ReportesDanoActions.create({ form, fotos, id })`, sin inyectar `Actions` ni
suscribirse a nada. `/publicar-propiedad` está conectado a `/api/v1/solicitudes-publicar-propiedad`
real (mismo patrón que `/ventas`/`/arrendar`, solo texto, sin fotos, store
`store/SolicitudesPublicarPropiedad`). `/credito-hipotecario` y `/reduccion-credito` siguen siendo
solo visuales, sin backend propio — enlazados desde el menú de búsqueda del hero o desde "Publica tu
propiedad") + contacto vía WhatsApp
(`core/whatsapp/whatsapp.util.ts`, usado en landing, navbar, `/reportes` y
`shared/components/publicar-whatsapp-fab`) + login/register + dashboard + `features/design-system`
(showcase de componentes UI). El área superadmin (`layouts/admin-layout`, ruta `/admin`, con
`layouts/sidebar` y `layouts/topbar` como componentes propios) tiene los módulos "Propiedades",
"Proyectos", "Citas", "Campaña", "Solicitudes de venta", "Solicitudes de arriendo",
"Propietarios (arrendar propiedad)", "Publicar propiedad", "Documentos de propietarios" y
"Reportes de daño" (`features/admin/propiedades`, `features/admin/proyectos`,
`features/admin/citas`, `features/admin/campana`, `features/admin/solicitudes-venta`,
`features/admin/solicitudes-arriendo`, `features/admin/solicitudes-arrendar-propiedad`,
`features/admin/solicitudes-publicar-propiedad`, `features/admin/solicitudes-documentos-propietario`,
`features/admin/reportes-dano`, stores `store/Propiedades`, `store/Proyectos`, `store/Citas`,
`store/Campana`, `store/SolicitudesVenta`, `store/SolicitudesArriendo`,
`store/SolicitudesArrendarPropiedad`, `store/SolicitudesPublicarPropiedad`,
`store/SolicitudesDocumentosPropietario`, `store/ReportesDano`). Como el
resto de módulos de "Solicitudes", "Reportes de daño" (y "Documentos de propietarios", salvo el
botón de validar) es listado + modal de detalle de solo lectura
(`ReportesDanoListComponent`/`ReporteDanoDetalleModalComponent`, sin editar/eliminar manual) — la
purga automática de 15 días sigue siendo la única forma en que desaparecen los reportes de daño (no
así los documentos de propietarios, ver Estado actual). El
calendario de Citas usa
`angular-calendar` (vistas mes/semana/día, crear/editar/mover/redimensionar citas con clic y
arrastre) — el superadmin gestiona las citas manualmente; el agendamiento automático desde los
formularios públicos del landing según disponibilidad queda pendiente de definir (no se decidió aún
qué formularios lo permitirán). El upload de fotos usa un servicio manual con `HttpClient`/`FormData`
(`propiedad-upload.service.ts`, `proyecto-upload.service.ts`, `reporte-dano-upload.service.ts` en
`features/reportes/`) porque el cliente ng-openapi generado no arma bien el body multipart (serializa
cada archivo con `String(file)` en vez de adjuntarlo como binario); el resto de operaciones
(list/get/update/delete) sí usan el cliente generado. Estos servicios de upload solo los inyecta el
Effect correspondiente (`PropiedadesEffects`, `ReportesDanoEffects`, etc.), nunca un componente.

**Publicación de propiedad por el propio propietario** (rama `feature/publicarcon`, sin commitear
todavía): un propietario que ya contrató un plan en `/publicar-por-tu-cuenta` sube sus documentos
legales (cédula, certificado de libertad y tradición, escritura, comprobante de pago, y poder
opcional; PDFs hasta 10MB validados en `storage.py::validate_document`, guardados en MinIO bajo
`documentos-propietario/*`) vía el modal `carga-documentos-modal` (dispara
`SolicitudesDocumentosPropietarioActions.create`). Eso crea una fila de `SolicitudDocumentoPropietario`
(tabla `solicitudes_documentos_propietario`). El superadmin la revisa en
`/admin/solicitudes-documentos-propietario` (`SolicitudesDocumentosPropietarioListComponent` +
`SolicitudDocumentoPropietarioDetalleModalComponent`, mismo patrón listado + modal de detalle que
`reportes-dano`, viendo los 5 documentos vía URLs firmadas de 1h) y, si están correctos, hace clic
en "Validar documentos" (`POST /{id}/validar`) — esto genera un token de un solo uso válido 48h y el
modal muestra un botón "Enviar por WhatsApp" (`whatsappLink()`) con un link a
`/publicar-mi-propiedad/:token`. Esa página pública (`features/publicar-mi-propiedad/`, con
navbar/footer y `<meta name="robots" content="noindex, nofollow">`) verifica el
token (`checkToken`) y, si es válido, muestra el mismo formulario de propiedad de ~35 campos que usa
el admin (matriz de campos por `tipo_inmueble` extraída a `store/Propiedades/propiedad-form-fields.ts`
y compartida entre `PropiedadFormComponent` y `PublicarMiPropiedadComponent` para no duplicarla) con
solo `foto_principal` (sin galería). Al enviar, despacha `PropiedadesActions.createConToken({ token,
form, fotoPrincipal })`, que pega contra `POST /api/v1/propiedades/publicar-con-token/{token}` —
crea la `Propiedad` con `destacada=true` (se posiciona primero en `list_propiedades`, ver
`crud/propiedad.py`) y `solicitud_documento_id` apuntando a la solicitud (FK `ondelete=SET NULL`),
y quema el token (`marcar_token_usado`). La página muestra un estado de confirmación (sin redirect
automático); un segundo intento con el mismo link muestra "vencido/usado". A propósito,
`SolicitudDocumentoPropietario` **no** está en `purga_solicitudes.py` (comentario explicativo en ese
archivo): son documentos legales de una propiedad que puede seguir publicada después de los 15 días
de retención del resto de solicitudes.

Módulos de negocio adicionales del dominio inmobiliario siguen pendientes de definir/construir.
