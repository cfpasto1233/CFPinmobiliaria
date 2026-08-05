from fastapi import APIRouter

from app.api.deps import SessionDep, SuperUser
from app.crud.solicitud_arrendar_propiedad import (
    create_solicitud_arrendar_propiedad,
    list_solicitudes_arrendar_propiedad,
)
from app.schemas.solicitud_arrendar_propiedad import (
    SolicitudArrendarPropiedadForm,
    SolicitudArrendarPropiedadPublic,
    SolicitudesArrendarPropiedadPublic,
)

router = APIRouter(
    prefix="/solicitudes-arrendar-propiedad", tags=["solicitudes-arrendar-propiedad"]
)


@router.post("/", response_model=SolicitudArrendarPropiedadPublic)
def create_solicitud_arrendar_propiedad_endpoint(
    session: SessionDep,
    solicitud_in: SolicitudArrendarPropiedadForm,
) -> SolicitudArrendarPropiedadPublic:
    return create_solicitud_arrendar_propiedad(session=session, form=solicitud_in)


@router.get("/", response_model=SolicitudesArrendarPropiedadPublic)
def read_solicitudes_arrendar_propiedad(
    session: SessionDep,
    _: SuperUser,
    skip: int = 0,
    limit: int = 100,
) -> SolicitudesArrendarPropiedadPublic:
    items, count = list_solicitudes_arrendar_propiedad(session=session, skip=skip, limit=limit)
    return SolicitudesArrendarPropiedadPublic(data=list(items), count=count)
