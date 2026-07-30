from fastapi import APIRouter

from app.api.deps import SessionDep, SuperUser
from app.crud.solicitud_venta import create_solicitud_venta, list_solicitudes_venta
from app.schemas.solicitud_venta import (
    SolicitudesVentaPublic,
    SolicitudVentaForm,
    SolicitudVentaPublic,
)

router = APIRouter(prefix="/solicitudes-venta", tags=["solicitudes-venta"])


@router.post("/", response_model=SolicitudVentaPublic)
def create_solicitud_venta_endpoint(
    session: SessionDep,
    solicitud_in: SolicitudVentaForm,
) -> SolicitudVentaPublic:
    return create_solicitud_venta(session=session, form=solicitud_in)


@router.get("/", response_model=SolicitudesVentaPublic)
def read_solicitudes_venta(
    session: SessionDep,
    _: SuperUser,
    skip: int = 0,
    limit: int = 100,
) -> SolicitudesVentaPublic:
    items, count = list_solicitudes_venta(session=session, skip=skip, limit=limit)
    return SolicitudesVentaPublic(data=list(items), count=count)
