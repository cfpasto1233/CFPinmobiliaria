from fastapi import APIRouter

from app.api.deps import SessionDep, SuperUser
from app.crud.solicitud_sugerencia import create_solicitud_sugerencia, list_solicitudes_sugerencias
from app.schemas.solicitud_sugerencia import (
    SolicitudesSugerenciasPublic,
    SolicitudSugerenciaForm,
    SolicitudSugerenciaPublic,
)

router = APIRouter(prefix="/solicitudes-sugerencias", tags=["solicitudes-sugerencias"])


@router.post("/", response_model=SolicitudSugerenciaPublic)
def create_solicitud_sugerencia_endpoint(
    session: SessionDep,
    solicitud_in: SolicitudSugerenciaForm,
) -> SolicitudSugerenciaPublic:
    return create_solicitud_sugerencia(session=session, form=solicitud_in)


@router.get("/", response_model=SolicitudesSugerenciasPublic)
def read_solicitudes_sugerencias(
    session: SessionDep,
    _: SuperUser,
    skip: int = 0,
    limit: int = 100,
) -> SolicitudesSugerenciasPublic:
    items, count = list_solicitudes_sugerencias(session=session, skip=skip, limit=limit)
    return SolicitudesSugerenciasPublic(data=list(items), count=count)
