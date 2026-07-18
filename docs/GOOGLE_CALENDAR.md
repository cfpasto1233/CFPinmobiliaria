# Google Calendar — Integración de Agendamiento

Sistema de agendamiento integrado con Google Calendar.
Permite a usuarios elegir un horario disponible; el evento se crea automáticamente en el calendario del responsable.

---

## Arquitectura del flujo

```
Usuario solicita cita → elige tipo de requerimiento
  → aparece selector de fecha/hora
  → Frontend llama GET /api/v1/contact/slots?date=YYYY-MM-DD&requirement_type=...
  → Backend impersona al organizador del tipo via Domain-Wide Delegation
  → consulta freebusy de TODOS los asistentes del tipo en Google Calendar
  → retorna slots de 1h donde TODOS están libres
  → usuario selecciona slot
  → usuario envía el formulario (con scheduled_at en ISO 8601)
  → backend impersona al organizador → crea evento en su calendario
  → invita a todos los asistentes del tipo + al cliente
  → guarda la solicitud con scheduled_at + calendar_event_id
```

---

## Autenticación: Domain-Wide Delegation (DWD)

Se usa una **Service Account** de Google Cloud con DWD para impersonar usuarios del dominio
sin requerir flujo OAuth interactivo.

### Pasos de configuración (única vez por proyecto)

1. **Google Cloud Console** → Crear proyecto (ej. `cfpasto-calendar`)
2. **APIs & Services** → Habilitar **Google Calendar API**
3. **IAM & Admin** → **Service Accounts** → Crear service account
   - Nombre: `cfpasto-calendar-bot`
   - Crear clave JSON → descargar
   - Habilitar DWD en la pestaña "Details"
4. **Google Workspace Admin** (`admin.google.com`) → Security → API controls → Domain-Wide Delegation
   - Agregar el Client ID de la service account
   - Scope: `https://www.googleapis.com/auth/calendar`

### Variable de entorno

```env
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"cfpasto-calendar",...}
```

> El JSON va en **una sola línea**. Para convertirlo:
> ```bash
> python3 -c "import json; print(json.dumps(json.load(open('service-account.json'))))"
> ```
> **NUNCA subir el JSON ni el `.env` al repositorio.**

### Agregar al backend (pyproject.toml)

```toml
"google-auth>=2.29.0"
"google-api-python-client>=2.126.0"
```

---

## Asignación de responsables por tipo

Configurar en `backend/app/core/google_calendar.py` según los responsables reales de Cfpasto:

| Tipo | Organizador (crea el evento) | Asistentes adicionales |
|---|---|---|
| `[tipo_1]` | responsable1@dominio.com | asistente1@dominio.com |
| `[tipo_2]` | responsable2@dominio.com | — |
| `[sin_calendario]` | *(sin calendario)* | — |

- El **organizador** es quien crea el evento — queda en su calendario.
- La disponibilidad se verifica contra **todos** los asistentes del tipo.
- Los tipos sin entrada en el mapa retornan `[]` → el selector no se muestra.

---

## Horarios disponibles

Configurar en `backend/app/core/google_calendar.py` según la política de Cfpasto:

| Día | Horario sugerido |
|---|---|
| Lunes – Viernes | 8:00 AM – 5:00 PM (slots de 1h) |
| Sábado | 8:00 AM – 12:00 PM (slots de 1h) |
| Domingo | No disponible |

Los slots ya pasados (hora actual de Colombia) se descartan automáticamente.
Timezone: `America/Bogota`.

---

## Archivos a crear en el backend

| Archivo | Responsabilidad |
|---|---|
| `backend/app/core/google_calendar.py` | Lógica principal: `get_available_slots()` y `create_event()` con DWD |
| `backend/app/core/config.py` | Agregar setting `GOOGLE_SERVICE_ACCOUNT_JSON` |
| `backend/app/models/` | Agregar campos `scheduled_at` y `calendar_event_id` al modelo que corresponda |
| `backend/app/schemas/` | Agregar schemas `AvailableSlot`, `SlotsResponse`; campo `scheduled_at` |
| `backend/app/api/routes/` | Endpoint `GET /slots` y creación de evento en el endpoint de submit |

## Archivos a crear en el frontend

| Archivo | Responsabilidad |
|---|---|
| `frontend/src/app/shared/components/calendar/calendar.ts` | Componente modal de selección de fecha/slot |
| `frontend/src/app/shared/components/calendar/calendar.html` | UI del modal |
| Componente que integra el calendario | Maneja señales `showCalendar`, `selectedSlot`; limpia slot al cambiar tipo |

---

## API a implementar

### `GET /api/v1/[módulo]/slots`

Retorna los slots disponibles para una fecha y tipo.

**Query params:**

| Param | Tipo | Ejemplo |
|---|---|---|
| `date` | `YYYY-MM-DD` | `2026-07-20` |
| `requirement_type` | string | `tipo_1` |

**Respuesta exitosa `200`:**
```json
{
  "slots": [
    { "datetime_iso": "2026-07-20T08:00:00-05:00", "label": "8:00 AM" },
    { "datetime_iso": "2026-07-20T09:00:00-05:00", "label": "9:00 AM" }
  ]
}
```

**Comportamiento ante errores de Google Calendar:** retorna `{ "slots": [] }` sin romper el flujo.
El error queda registrado como `WARNING` en el log del backend.

---

## Implementación de `google_calendar.py` (referencia)

```python
# backend/app/core/google_calendar.py
import json
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from google.oauth2 import service_account
from googleapiclient.discovery import build

from app.core.config import settings

BOGOTA_TZ = ZoneInfo("America/Bogota")
SCOPES = ["https://www.googleapis.com/auth/calendar"]

# Mapear tipos de requerimiento a responsables
# Completar con los emails reales de Cfpasto
CALENDAR_ASSIGNEES: dict[str, dict] = {
    "tipo_1": {
        "organizer": "responsable@dominio.com",
        "attendees": ["responsable@dominio.com", "asistente@dominio.com"],
    },
    # Tipos sin calendario no van aquí → retornan slots vacíos
}

WORK_HOURS = {
    0: (8, 17),  # Lunes
    1: (8, 17),  # Martes
    2: (8, 17),  # Miércoles
    3: (8, 17),  # Jueves
    4: (8, 17),  # Viernes
    5: (8, 12),  # Sábado
    # 6: Domingo — no disponible
}


def _get_service(impersonate: str):
    sa_info = json.loads(settings.GOOGLE_SERVICE_ACCOUNT_JSON)
    creds = service_account.Credentials.from_service_account_info(
        sa_info,
        scopes=SCOPES,
        subject=impersonate,
    )
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def get_available_slots(date_str: str, requirement_type: str) -> list[dict]:
    assignees = CALENDAR_ASSIGNEES.get(requirement_type)
    if not assignees:
        return []

    organizer = assignees["organizer"]
    attendees = assignees["attendees"]

    date = datetime.strptime(date_str, "%Y-%m-%d").date()
    weekday = date.weekday()
    if weekday not in WORK_HOURS:
        return []

    start_hour, end_hour = WORK_HOURS[weekday]
    now = datetime.now(BOGOTA_TZ)

    try:
        service = _get_service(organizer)
        day_start = datetime(date.year, date.month, date.day, 0, 0, tzinfo=BOGOTA_TZ)
        day_end = datetime(date.year, date.month, date.day, 23, 59, tzinfo=BOGOTA_TZ)

        body = {
            "timeMin": day_start.isoformat(),
            "timeMax": day_end.isoformat(),
            "timeZone": "America/Bogota",
            "items": [{"id": email} for email in attendees],
        }
        freebusy = service.freebusy().query(body=body).execute()
        busy_intervals = []
        for calendar_data in freebusy.get("calendars", {}).values():
            for period in calendar_data.get("busy", []):
                busy_intervals.append((
                    datetime.fromisoformat(period["start"]),
                    datetime.fromisoformat(period["end"]),
                ))
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Error consultando Google Calendar: %s", e)
        return []

    slots = []
    for hour in range(start_hour, end_hour):
        slot_start = datetime(date.year, date.month, date.day, hour, 0, tzinfo=BOGOTA_TZ)
        slot_end = slot_start + timedelta(hours=1)

        if slot_start <= now:
            continue

        is_busy = any(
            b_start < slot_end and b_end > slot_start
            for b_start, b_end in busy_intervals
        )
        if not is_busy:
            label = slot_start.strftime("%-I:%M %p") if hasattr(slot_start, "strftime") else f"{hour}:00"
            slots.append({
                "datetime_iso": slot_start.isoformat(),
                "label": label,
            })

    return slots


def create_event(
    organizer: str,
    attendees: list[str],
    client_email: str,
    scheduled_at: datetime,
    summary: str,
    description: str = "",
) -> str | None:
    try:
        service = _get_service(organizer)
        end_time = scheduled_at + timedelta(hours=1)
        event = {
            "summary": summary,
            "description": description,
            "start": {"dateTime": scheduled_at.isoformat(), "timeZone": "America/Bogota"},
            "end": {"dateTime": end_time.isoformat(), "timeZone": "America/Bogota"},
            "attendees": [
                {"email": email} for email in attendees
            ] + [{"email": client_email}],
        }
        created = service.events().insert(
            calendarId="primary",
            body=event,
            sendUpdates="all",
        ).execute()
        return created.get("id")
    except Exception as e:
        import logging
        logging.getLogger(__name__).warning("Error creando evento Google Calendar: %s", e)
        return None
```

---

## Agregar setting a config.py

```python
# backend/app/core/config.py — agregar en la clase Settings
GOOGLE_SERVICE_ACCOUNT_JSON: str = ""
```

---

## Verificación del sistema

1. **Endpoint de slots:**
   ```
   GET /api/v1/[módulo]/slots?date=2026-07-21&requirement_type=tipo_1
   ```
   Debe retornar slots donde los responsables están libres.

2. **Submit con slot:**
   Enviar formulario con `scheduled_at` → el evento aparece en el calendario del organizador con todos los invitados.

3. **Fallo de DWD:** Si las credenciales fallan, el flujo igual continúa. En logs aparece:
   `WARNING: Error consultando Google Calendar: ...`

4. **Sin slot:** Enviar sin elegir horario → `scheduled_at` es `None`, sin llamada a Google Calendar.
