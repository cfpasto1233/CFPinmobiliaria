import uuid
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.cita import Cita
from app.schemas.cita import CitaForm, CitaRecaudoForm, CitaUpdate, DisponibilidadDia
from app.services.recaudo_slots import (
    DURACION_CITA,
    color_dia,
    combinar_fecha_hora_colombia,
    fecha_minima_reservable,
    horas_permitidas,
    rango_utc_para_fechas,
)


def create_cita(*, session: Session, form: CitaForm) -> Cita:
    db_obj = Cita(**form.model_dump())
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_cita_by_id(*, session: Session, cita_id: uuid.UUID) -> Cita | None:
    return session.get(Cita, cita_id)


def update_cita(*, session: Session, db_obj: Cita, obj_in: CitaUpdate) -> Cita:
    data = obj_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    if db_obj.fecha_fin <= db_obj.fecha_inicio:
        raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio.")
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_citas_por_rango(*, session: Session, desde: datetime, hasta: datetime) -> list[Cita]:
    items = session.scalars(
        select(Cita)
        .where(Cita.fecha_inicio <= hasta, Cita.fecha_fin >= desde)
        .options(selectinload(Cita.solicitud_venta), selectinload(Cita.solicitud_arriendo))
        .order_by(Cita.fecha_inicio.asc())
    ).all()
    return list(items)


def delete_cita(*, session: Session, db_obj: Cita) -> None:
    session.delete(db_obj)
    session.commit()


def listar_disponibilidad_recaudo(
    *, session: Session, desde: date, hasta: date
) -> list[DisponibilidadDia]:
    inicio_utc, fin_utc = rango_utc_para_fechas(desde, hasta)
    citas_existentes = list_citas_por_rango(session=session, desde=inicio_utc, hasta=fin_utc)
    minimo = fecha_minima_reservable()

    dias: list[DisponibilidadDia] = []
    dia_actual = desde
    while dia_actual <= hasta:
        color = color_dia(dia_actual, minimo)
        horas = horas_permitidas(dia_actual) if color != "no_disponible" else []

        horas_libres = []
        for hora in horas:
            slot_inicio = combinar_fecha_hora_colombia(dia_actual, hora).astimezone(timezone.utc)
            slot_fin = slot_inicio + DURACION_CITA
            hay_conflicto = any(
                cita.fecha_inicio < slot_fin and cita.fecha_fin > slot_inicio
                for cita in citas_existentes
            )
            if not hay_conflicto:
                horas_libres.append(hora)

        dias.append(
            DisponibilidadDia(fecha=dia_actual, color=color, horas_disponibles=horas_libres)
        )
        dia_actual += timedelta(days=1)

    return dias


def crear_cita_recaudo(*, session: Session, form: CitaRecaudoForm) -> Cita:
    minimo = fecha_minima_reservable()
    if form.fecha < minimo:
        raise ValueError("La fecha seleccionada ya no tiene la anticipación mínima requerida.")

    permitidas = horas_permitidas(form.fecha)
    if form.hora not in permitidas:
        raise ValueError("El horario seleccionado no está disponible para esa fecha.")

    inicio = combinar_fecha_hora_colombia(form.fecha, form.hora).astimezone(timezone.utc)
    fin = inicio + DURACION_CITA

    conflictos = list_citas_por_rango(session=session, desde=inicio, hasta=fin)
    if conflictos:
        raise ValueError("Ese horario ya fue reservado. Elige otro horario disponible.")

    db_obj = Cita(
        titulo="Recaudo de canon",
        descripcion=form.observaciones,
        fecha_inicio=inicio,
        fecha_fin=fin,
        estado="pendiente",
        ubicacion=form.direccion_recaudo,
        nombre_contacto=form.nombre_contacto,
        telefono_contacto=form.telefono_contacto,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj
