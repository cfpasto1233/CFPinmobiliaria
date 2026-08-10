import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.logo import Logo
from app.schemas.logo import LogoForm, LogoUpdate


def create_logo(*, session: Session, form: LogoForm, imagen_key: str) -> Logo:
    db_obj = Logo(nombre=form.nombre, tipo=form.tipo, imagen_key=imagen_key)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_logos(*, session: Session, skip: int = 0, limit: int = 100) -> tuple[list[Logo], int]:
    count = session.scalar(select(func.count()).select_from(Logo))
    items = session.scalars(
        select(Logo).order_by(Logo.created_at.asc()).offset(skip).limit(limit)
    ).all()
    return list(items), count or 0


def get_logo_by_id(*, session: Session, logo_id: uuid.UUID) -> Logo | None:
    return session.get(Logo, logo_id)


def update_logo(*, session: Session, db_obj: Logo, obj_in: LogoUpdate) -> Logo:
    data = obj_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def replace_imagen(*, session: Session, logo: Logo, key: str) -> str:
    old_key = logo.imagen_key
    logo.imagen_key = key
    session.add(logo)
    session.commit()
    session.refresh(logo)
    return old_key


def delete_logo(*, session: Session, db_obj: Logo) -> str:
    key = db_obj.imagen_key
    session.delete(db_obj)
    session.commit()
    return key
