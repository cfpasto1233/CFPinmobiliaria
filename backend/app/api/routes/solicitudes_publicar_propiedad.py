from fastapi import APIRouter

from app.api.deps import SessionDep, SuperUser
from app.crud.solicitud_publicar_propiedad import (
    create_solicitud_publicar_propiedad,
    list_solicitudes_publicar_propiedad,
)
from app.schemas.solicitud_publicar_propiedad import (
    SolicitudesPublicarPropiedadPublic,
    SolicitudPublicarPropiedadForm,
    SolicitudPublicarPropiedadPublic,
)

router = APIRouter(
    prefix="/solicitudes-publicar-propiedad", tags=["solicitudes-publicar-propiedad"]
)


@router.post("/", response_model=SolicitudPublicarPropiedadPublic)
def create_solicitud_publicar_propiedad_endpoint(
    session: SessionDep,
    solicitud_in: SolicitudPublicarPropiedadForm,
) -> SolicitudPublicarPropiedadPublic:
    return create_solicitud_publicar_propiedad(session=session, form=solicitud_in)


@router.get("/", response_model=SolicitudesPublicarPropiedadPublic)
def read_solicitudes_publicar_propiedad(
    session: SessionDep,
    _: SuperUser,
    skip: int = 0,
    limit: int = 100,
) -> SolicitudesPublicarPropiedadPublic:
    items, count = list_solicitudes_publicar_propiedad(session=session, skip=skip, limit=limit)
    return SolicitudesPublicarPropiedadPublic(data=list(items), count=count)
