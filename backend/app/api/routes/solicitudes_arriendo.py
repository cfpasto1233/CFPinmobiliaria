from fastapi import APIRouter

from app.api.deps import SessionDep, SuperUser
from app.crud.solicitud_arriendo import create_solicitud_arriendo, list_solicitudes_arriendo
from app.schemas.solicitud_arriendo import (
    SolicitudArriendoForm,
    SolicitudArriendoPublic,
    SolicitudesArriendoPublic,
)

router = APIRouter(prefix="/solicitudes-arriendo", tags=["solicitudes-arriendo"])


@router.post("/", response_model=SolicitudArriendoPublic)
def create_solicitud_arriendo_endpoint(
    session: SessionDep,
    solicitud_in: SolicitudArriendoForm,
) -> SolicitudArriendoPublic:
    return create_solicitud_arriendo(session=session, form=solicitud_in)


@router.get("/", response_model=SolicitudesArriendoPublic)
def read_solicitudes_arriendo(
    session: SessionDep,
    _: SuperUser,
    skip: int = 0,
    limit: int = 100,
) -> SolicitudesArriendoPublic:
    items, count = list_solicitudes_arriendo(session=session, skip=skip, limit=limit)
    return SolicitudesArriendoPublic(data=list(items), count=count)
