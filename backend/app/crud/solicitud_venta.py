from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.solicitud_venta import SolicitudVenta
from app.schemas.solicitud_venta import SolicitudVentaForm


def create_solicitud_venta(*, session: Session, form: SolicitudVentaForm) -> SolicitudVenta:
    db_obj = SolicitudVenta(
        nombre_completo=form.nombre_completo,
        medio_comunicacion=form.medio_comunicacion,
        presupuesto_total=form.presupuesto_total,
        forma_pago=form.forma_pago,
        sectores_interes=form.sectores_interes,
        valor_disponible_credito=form.valor_disponible_credito,
        valor_disponible_contado=form.valor_disponible_contado,
        forma_pago_otro=form.forma_pago_otro,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_solicitudes_venta(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[SolicitudVenta], int]:
    count = session.scalar(select(func.count()).select_from(SolicitudVenta))
    items = session.scalars(
        select(SolicitudVenta).order_by(SolicitudVenta.created_at.desc()).offset(skip).limit(limit)
    ).all()
    return list(items), count or 0
