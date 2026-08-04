import logging

from app.core.config import settings
from app.core.db import SessionLocal
from app.crud.solicitud_arrendar_propiedad import delete_solicitudes_arrendar_propiedad_antiguas
from app.crud.solicitud_arriendo import delete_solicitudes_arriendo_antiguas
from app.crud.solicitud_venta import delete_solicitudes_venta_antiguas

logger = logging.getLogger(__name__)


def purgar_solicitudes_antiguas() -> None:
    dias = settings.SOLICITUDES_RETENTION_DIAS
    with SessionLocal() as session:
        borradas_venta = delete_solicitudes_venta_antiguas(session=session, dias=dias)
        borradas_arriendo = delete_solicitudes_arriendo_antiguas(session=session, dias=dias)
        borradas_arrendar_propiedad = delete_solicitudes_arrendar_propiedad_antiguas(
            session=session, dias=dias
        )

    if borradas_venta or borradas_arriendo or borradas_arrendar_propiedad:
        logger.info(
            "Purga de solicitudes antiguas (>%s días): %s de venta, %s de arriendo, "
            "%s de arrendar-propiedad",
            dias,
            borradas_venta,
            borradas_arriendo,
            borradas_arrendar_propiedad,
        )
