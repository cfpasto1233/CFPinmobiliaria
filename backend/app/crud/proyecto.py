import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.proyecto import Proyecto
from app.schemas.proyecto import ProyectoForm, ProyectoUpdate


def create_proyecto(*, session: Session, form: ProyectoForm, foto_portada_key: str) -> Proyecto:
    max_orden = session.scalar(select(func.max(Proyecto.orden))) or 0
    db_obj = Proyecto(
        nombre=form.nombre,
        descripcion=form.descripcion,
        ubicacion=form.ubicacion,
        estado=form.estado,
        foto_portada_key=foto_portada_key,
        orden=max_orden + 1,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_proyecto(*, session: Session, db_obj: Proyecto, obj_in: ProyectoUpdate) -> Proyecto:
    data = obj_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_proyectos(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[Proyecto], int]:
    count = session.scalar(select(func.count()).select_from(Proyecto))
    items = session.scalars(
        select(Proyecto)
        .order_by(Proyecto.orden.asc(), Proyecto.created_at.asc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(items), count or 0


def reorder_proyectos(*, session: Session, ids: list[uuid.UUID]) -> tuple[list[Proyecto], int]:
    proyectos = session.scalars(select(Proyecto).where(Proyecto.id.in_(ids))).all()
    by_id = {proyecto.id: proyecto for proyecto in proyectos}
    for index, proyecto_id in enumerate(ids):
        proyecto = by_id.get(proyecto_id)
        if proyecto is not None:
            proyecto.orden = index
    session.commit()
    return list_proyectos(session=session)


def get_proyecto_by_id(*, session: Session, proyecto_id: uuid.UUID) -> Proyecto | None:
    return session.get(Proyecto, proyecto_id)


def delete_proyecto(*, session: Session, db_obj: Proyecto) -> str:
    key = db_obj.foto_portada_key
    session.delete(db_obj)
    session.commit()
    return key


def replace_foto_portada(*, session: Session, proyecto: Proyecto, key: str) -> str:
    old_key = proyecto.foto_portada_key
    proyecto.foto_portada_key = key
    session.add(proyecto)
    session.commit()
    session.refresh(proyecto)
    return old_key
