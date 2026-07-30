from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.campana import Campana
from app.schemas.campana import CampanaForm


def get_campana(*, session: Session) -> Campana | None:
    return session.scalar(select(Campana).order_by(Campana.created_at.desc()).limit(1))


def upsert_campana(*, session: Session, form: CampanaForm) -> Campana:
    db_obj = get_campana(session=session)
    if db_obj is None:
        db_obj = Campana(
            nombre=form.nombre,
            fecha_inicio=form.fecha_inicio,
            fecha_fin=form.fecha_fin,
            descripcion_corta=form.descripcion_corta,
        )
    else:
        db_obj.nombre = form.nombre
        db_obj.fecha_inicio = form.fecha_inicio
        db_obj.fecha_fin = form.fecha_fin
        db_obj.descripcion_corta = form.descripcion_corta
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj
