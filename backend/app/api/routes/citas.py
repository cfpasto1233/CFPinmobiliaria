import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep, SuperUser
from app.crud.cita import (
    create_cita,
    delete_cita,
    get_cita_by_id,
    list_citas_por_rango,
    update_cita,
)
from app.schemas.cita import CitaForm, CitaOut, CitaPublic, CitasPublic, CitaUpdate

router = APIRouter(prefix="/citas", tags=["citas"])


@router.get("/", response_model=CitasPublic)
def read_citas(
    session: SessionDep,
    _: SuperUser,
    desde: datetime,
    hasta: datetime,
) -> CitasPublic:
    items = list_citas_por_rango(session=session, desde=desde, hasta=hasta)
    return CitasPublic(data=list(items), count=len(items))


@router.get("/{cita_id}", response_model=CitaOut)
def read_cita_by_id(cita_id: uuid.UUID, session: SessionDep, _: SuperUser) -> CitaOut:
    cita = get_cita_by_id(session=session, cita_id=cita_id)
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")
    return CitaOut(data=cita)


@router.post("/", response_model=CitaPublic)
def create_cita_endpoint(session: SessionDep, _: SuperUser, cita_in: CitaForm) -> CitaPublic:
    return create_cita(session=session, form=cita_in)


@router.patch("/{cita_id}", response_model=CitaPublic)
def update_cita_endpoint(
    cita_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    cita_in: CitaUpdate,
) -> CitaPublic:
    cita = get_cita_by_id(session=session, cita_id=cita_id)
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")
    try:
        return update_cita(session=session, db_obj=cita, obj_in=cita_in)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.delete("/{cita_id}")
def delete_cita_endpoint(cita_id: uuid.UUID, session: SessionDep, _: SuperUser) -> dict[str, str]:
    cita = get_cita_by_id(session=session, cita_id=cita_id)
    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada.")
    delete_cita(session=session, db_obj=cita)
    return {"message": "Cita deleted"}
