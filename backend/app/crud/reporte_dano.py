import uuid
from datetime import timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.db.base import utc_now
from app.models.reporte_dano import ReporteDano
from app.schemas.reporte_dano import ReporteDanoForm
from app.services import storage


def get_reporte_dano_by_id(*, session: Session, reporte_id: uuid.UUID) -> ReporteDano | None:
    return session.get(ReporteDano, reporte_id)


def list_reportes_dano(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[ReporteDano], int]:
    count = session.scalar(select(func.count()).select_from(ReporteDano))
    items = session.scalars(
        select(ReporteDano).order_by(ReporteDano.created_at.desc()).offset(skip).limit(limit)
    ).all()
    return list(items), count or 0


def create_reporte_dano(
    *, session: Session, id: uuid.UUID, form: ReporteDanoForm, fotos: list[str]
) -> ReporteDano:
    db_obj = ReporteDano(
        id=id,
        nombre_completo=form.nombre_completo,
        medio_comunicacion=form.medio_comunicacion,
        numero_contacto=form.numero_contacto,
        tipo_reporte=form.tipo_reporte,
        tipo_reporte_otro=form.tipo_reporte_otro,
        descripcion_dano=form.descripcion_dano,
        fotos=fotos,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def delete_reportes_dano_antiguos(*, session: Session, dias: int) -> int:
    corte = utc_now() - timedelta(days=dias)
    antiguos = session.scalars(select(ReporteDano).where(ReporteDano.created_at < corte)).all()
    for reporte in antiguos:
        for key in reporte.fotos:
            storage.delete_object(key)

    result = session.execute(delete(ReporteDano).where(ReporteDano.created_at < corte))
    session.commit()
    return result.rowcount  # type: ignore[attr-defined]
