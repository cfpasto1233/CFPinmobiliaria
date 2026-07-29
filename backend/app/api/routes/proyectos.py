import uuid
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app.api.deps import SessionDep, SuperUser
from app.crud.proyecto import (
    create_proyecto,
    delete_proyecto,
    get_proyecto_by_id,
    list_proyectos,
    reorder_proyectos,
    replace_foto_portada,
    update_proyecto,
)
from app.schemas.proyecto import (
    EstadoProyecto,
    ProyectoForm,
    ProyectoPublic,
    ProyectosPublic,
    ProyectosReorder,
    ProyectoUpdate,
)
from app.services import storage

router = APIRouter(prefix="/proyectos", tags=["proyectos"])


def _mensaje_error_validacion(exc: ValidationError) -> str:
    return " ".join(error["msg"].removeprefix("Value error, ") for error in exc.errors())


@router.get("/", response_model=ProyectosPublic)
def read_proyectos(session: SessionDep, skip: int = 0, limit: int = 100) -> ProyectosPublic:
    items, count = list_proyectos(session=session, skip=skip, limit=limit)
    return ProyectosPublic(data=list(items), count=count)


@router.patch("/orden", response_model=ProyectosPublic)
def reorder_proyectos_endpoint(
    session: SessionDep,
    _: SuperUser,
    reorder_in: ProyectosReorder,
) -> ProyectosPublic:
    items, count = reorder_proyectos(session=session, ids=reorder_in.ids)
    return ProyectosPublic(data=list(items), count=count)


@router.get("/{proyecto_id}", response_model=ProyectoPublic)
def read_proyecto_by_id(proyecto_id: uuid.UUID, session: SessionDep) -> ProyectoPublic:
    proyecto = get_proyecto_by_id(session=session, proyecto_id=proyecto_id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")
    return proyecto


@router.post("/", response_model=ProyectoPublic)
def create_proyecto_endpoint(
    session: SessionDep,
    _: SuperUser,
    # Mismos límites que ProyectoForm, declarados aquí para que FastAPI los valide como
    # parte del request (422 con detalle por campo) — ver mismo patrón en propiedades.py.
    nombre: Annotated[str, Form(min_length=1, max_length=255)],
    descripcion: Annotated[str, Form(min_length=1)],
    ubicacion: Annotated[str, Form(min_length=1, max_length=255)],
    estado: Annotated[EstadoProyecto, Form()],
    foto_portada: Annotated[UploadFile, File()],
) -> ProyectoPublic:
    try:
        form = ProyectoForm(
            nombre=nombre, descripcion=descripcion, ubicacion=ubicacion, estado=estado
        )
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=_mensaje_error_validacion(exc)) from exc
    storage.validate_image(foto_portada)
    key = storage.upload_image(foto_portada, folder="proyectos")
    return create_proyecto(session=session, form=form, foto_portada_key=key)


@router.patch("/{proyecto_id}", response_model=ProyectoPublic)
def update_proyecto_endpoint(
    proyecto_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    proyecto_in: ProyectoUpdate,
) -> ProyectoPublic:
    proyecto = get_proyecto_by_id(session=session, proyecto_id=proyecto_id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")
    return update_proyecto(session=session, db_obj=proyecto, obj_in=proyecto_in)


@router.delete("/{proyecto_id}")
def delete_proyecto_endpoint(
    proyecto_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
) -> dict[str, str]:
    proyecto = get_proyecto_by_id(session=session, proyecto_id=proyecto_id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")
    key = delete_proyecto(session=session, db_obj=proyecto)
    storage.delete_object(key)
    return {"message": "Proyecto deleted"}


@router.post("/{proyecto_id}/foto-portada", response_model=ProyectoPublic)
def replace_foto_portada_endpoint(
    proyecto_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    file: Annotated[UploadFile, File()],
) -> ProyectoPublic:
    proyecto = get_proyecto_by_id(session=session, proyecto_id=proyecto_id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")
    storage.validate_image(file)
    key = storage.upload_image(file, folder="proyectos")
    old_key = replace_foto_portada(session=session, proyecto=proyecto, key=key)
    storage.delete_object(old_key)
    return proyecto
