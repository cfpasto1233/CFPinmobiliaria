import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.evento import Evento
from app.schemas.evento import EventoForm, EventoUpdate


def create_evento(*, session: Session, form: EventoForm, foto_key: str) -> Evento:
    db_obj = Evento(**form.model_dump(), foto_key=foto_key)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_evento(*, session: Session, db_obj: Evento, obj_in: EventoUpdate) -> Evento:
    data = obj_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_eventos(*, session: Session, skip: int = 0, limit: int = 100) -> tuple[list[Evento], int]:
    count = session.scalar(select(func.count()).select_from(Evento))
    items = session.scalars(
        select(Evento).order_by(Evento.fecha.asc()).offset(skip).limit(limit)
    ).all()
    return list(items), count or 0


def get_evento_by_id(*, session: Session, evento_id: uuid.UUID) -> Evento | None:
    return session.get(Evento, evento_id)


def delete_evento(*, session: Session, db_obj: Evento) -> str:
    key = db_obj.foto_key
    session.delete(db_obj)
    session.commit()
    return key


def replace_foto(*, session: Session, evento: Evento, key: str) -> str:
    old_key = evento.foto_key
    evento.foto_key = key
    session.add(evento)
    session.commit()
    session.refresh(evento)
    return old_key
