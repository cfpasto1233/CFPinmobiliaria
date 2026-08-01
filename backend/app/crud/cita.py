import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.cita import Cita
from app.schemas.cita import CitaForm, CitaUpdate


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
