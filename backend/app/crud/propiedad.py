import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.propiedad import Propiedad
from app.models.propiedad_foto import PropiedadFoto
from app.schemas.propiedad import PropiedadForm, PropiedadUpdate


def create_propiedad(*, session: Session, form: PropiedadForm, foto_principal_key: str) -> Propiedad:
    max_orden = session.scalar(select(func.max(Propiedad.orden))) or 0
    db_obj = Propiedad(
        nombre=form.nombre,
        descripcion=form.descripcion,
        ubicacion=form.ubicacion,
        precio=form.precio,
        tipo=form.tipo,
        foto_principal_key=foto_principal_key,
        orden=max_orden + 1,
        tipo_inmueble=form.tipo_inmueble,
        banos=form.banos,
        habitaciones=form.habitaciones,
        tiene_parqueadero=form.tiene_parqueadero,
        num_parqueaderos=form.num_parqueaderos,
        area_construida=form.area_construida,
        antiguedad=form.antiguedad,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_propiedad(*, session: Session, db_obj: Propiedad, obj_in: PropiedadUpdate) -> Propiedad:
    data = obj_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_propiedades(*, session: Session, skip: int = 0, limit: int = 100) -> tuple[list[Propiedad], int]:
    count = session.scalar(select(func.count()).select_from(Propiedad))
    items = session.scalars(
        select(Propiedad).order_by(Propiedad.orden.asc(), Propiedad.created_at.asc()).offset(skip).limit(limit)
    ).all()
    return list(items), count or 0


def reorder_propiedades(*, session: Session, ids: list[uuid.UUID]) -> tuple[list[Propiedad], int]:
    propiedades = session.scalars(select(Propiedad).where(Propiedad.id.in_(ids))).all()
    by_id = {propiedad.id: propiedad for propiedad in propiedades}
    for index, propiedad_id in enumerate(ids):
        propiedad = by_id.get(propiedad_id)
        if propiedad is not None:
            propiedad.orden = index
    session.commit()
    return list_propiedades(session=session)


def get_propiedad_by_id(*, session: Session, propiedad_id: uuid.UUID) -> Propiedad | None:
    return session.get(Propiedad, propiedad_id)


def delete_propiedad(*, session: Session, db_obj: Propiedad) -> list[str]:
    keys = [db_obj.foto_principal_key] + [foto.key for foto in db_obj.fotos]
    session.delete(db_obj)
    session.commit()
    return keys


def add_propiedad_foto(*, session: Session, propiedad: Propiedad, key: str, orden: int) -> PropiedadFoto:
    db_obj = PropiedadFoto(propiedad_id=propiedad.id, key=key, orden=orden)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_propiedad_foto_by_id(*, session: Session, foto_id: uuid.UUID) -> PropiedadFoto | None:
    return session.get(PropiedadFoto, foto_id)


def delete_propiedad_foto(*, session: Session, db_obj: PropiedadFoto) -> str:
    key = db_obj.key
    session.delete(db_obj)
    session.commit()
    return key


def replace_foto_principal(*, session: Session, propiedad: Propiedad, key: str) -> str:
    old_key = propiedad.foto_principal_key
    propiedad.foto_principal_key = key
    session.add(propiedad)
    session.commit()
    session.refresh(propiedad)
    return old_key
