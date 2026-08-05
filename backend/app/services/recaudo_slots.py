from datetime import date, datetime, time, timedelta, timezone
from typing import Literal
from zoneinfo import ZoneInfo

COLOMBIA_TZ = ZoneInfo("America/Bogota")
DURACION_CITA = timedelta(hours=1)

HORAS_ESTANDAR = ["09:00", "11:00", "15:00", "18:00"]
HORAS_SABADO = ["11:00", "15:00"]
HORAS_AMARILLO_SEMANA = ["15:00", "16:00", "17:00"]
HORAS_AMARILLO_SABADO = ["15:00"]

ColorDia = Literal["verde", "amarillo", "no_disponible"]


def _bucket(dia: int) -> Literal["verde", "amarillo", "no_disponible"]:
    if 1 <= dia <= 5:
        return "verde"
    if 6 <= dia <= 14:
        return "amarillo"
    return "no_disponible"


def horas_permitidas(fecha: date) -> list[str]:
    if fecha.weekday() == 6:  # domingo
        return []

    bucket = _bucket(fecha.day)
    if bucket == "no_disponible":
        return []

    es_sabado = fecha.weekday() == 5
    if bucket == "verde":
        return HORAS_SABADO if es_sabado else HORAS_ESTANDAR
    return HORAS_AMARILLO_SABADO if es_sabado else HORAS_AMARILLO_SEMANA


def fecha_minima_reservable(ahora: datetime | None = None) -> date:
    ahora = (ahora or datetime.now(COLOMBIA_TZ)).astimezone(COLOMBIA_TZ)
    minimo = ahora.date() + timedelta(days=1)
    if ahora.time() >= time(18, 0):
        minimo += timedelta(days=1)
    return minimo


def color_dia(fecha: date, minimo: date) -> ColorDia:
    if fecha.weekday() == 6 or fecha < minimo:
        return "no_disponible"
    return _bucket(fecha.day)


def combinar_fecha_hora_colombia(fecha: date, hora: str) -> datetime:
    horas, minutos = (int(parte) for parte in hora.split(":"))
    return datetime(fecha.year, fecha.month, fecha.day, horas, minutos, tzinfo=COLOMBIA_TZ)


def rango_utc_para_fechas(desde: date, hasta: date) -> tuple[datetime, datetime]:
    inicio = datetime(desde.year, desde.month, desde.day, 0, 0, tzinfo=COLOMBIA_TZ)
    fin = datetime(hasta.year, hasta.month, hasta.day, 23, 59, 59, tzinfo=COLOMBIA_TZ)
    return inicio.astimezone(timezone.utc), fin.astimezone(timezone.utc)
