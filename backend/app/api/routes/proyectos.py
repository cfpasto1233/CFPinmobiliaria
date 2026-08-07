import json
import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import TypeAdapter, ValidationError

from app.api.deps import SessionDep, SuperUser
from app.crud.proyecto import (
    add_proyecto_foto,
    create_proyecto,
    delete_proyecto,
    delete_proyecto_foto,
    get_proyecto_by_id,
    get_proyecto_foto_by_id,
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
    ProyectoTipoForm,
    ProyectoUpdate,
)
from app.services import storage

router = APIRouter(prefix="/proyectos", tags=["proyectos"])

_tipos_adapter = TypeAdapter(list[ProyectoTipoForm])


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
    precio: Annotated[int, Form(gt=0)],
    foto_portada: Annotated[UploadFile, File()],
    financiacion: Annotated[bool, Form()] = False,
    financiacion_descripcion: Annotated[str | None, Form()] = None,
    credito_hipotecario: Annotated[bool, Form()] = False,
    credito_hipotecario_descripcion: Annotated[str | None, Form()] = None,
    tiene_zonas_comunes: Annotated[bool, Form()] = False,
    zonas_comunes: Annotated[str | None, Form()] = None,
    ascensor: Annotated[bool, Form()] = False,
    conjunto_cerrado: Annotated[bool, Form()] = False,
    valor_administracion_por_definir: Annotated[bool, Form()] = False,
    valor_administracion: Annotated[Decimal | None, Form()] = None,
    area_m2: Annotated[Decimal | None, Form()] = None,
    # Multipart no soporta listas de objetos anidados como los demás Form() —
    # se envía como un string JSON y se parsea aquí, junto con el resto de la
    # validación de ProyectoForm.
    tipos: Annotated[str, Form()] = "[]",
) -> ProyectoPublic:
    try:
        tipos_parsed = _tipos_adapter.validate_json(tipos)
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=_mensaje_error_validacion(exc)) from exc
    try:
        form = ProyectoForm(
            nombre=nombre,
            descripcion=descripcion,
            ubicacion=ubicacion,
            estado=estado,
            precio=precio,
            financiacion=financiacion,
            financiacion_descripcion=financiacion_descripcion,
            credito_hipotecario=credito_hipotecario,
            credito_hipotecario_descripcion=credito_hipotecario_descripcion,
            tiene_zonas_comunes=tiene_zonas_comunes,
            zonas_comunes=json.loads(zonas_comunes) if zonas_comunes else None,
            ascensor=ascensor,
            conjunto_cerrado=conjunto_cerrado,
            valor_administracion_por_definir=valor_administracion_por_definir,
            valor_administracion=valor_administracion,
            area_m2=area_m2,
            tipos=tipos_parsed,
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
    keys = delete_proyecto(session=session, db_obj=proyecto)
    for key in keys:
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


@router.post("/{proyecto_id}/fotos", response_model=ProyectoPublic)
def add_foto_endpoint(
    proyecto_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    file: Annotated[UploadFile, File()],
    descripcion: Annotated[str | None, Form()] = None,
) -> ProyectoPublic:
    proyecto = get_proyecto_by_id(session=session, proyecto_id=proyecto_id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")
    storage.validate_image(file)
    key = storage.upload_image(file, folder="proyectos")
    add_proyecto_foto(
        session=session, proyecto=proyecto, key=key, orden=len(proyecto.fotos), descripcion=descripcion
    )
    session.refresh(proyecto)
    return proyecto


@router.delete("/{proyecto_id}/fotos/{foto_id}", response_model=ProyectoPublic)
def delete_foto_endpoint(
    proyecto_id: uuid.UUID,
    foto_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
) -> ProyectoPublic:
    proyecto = get_proyecto_by_id(session=session, proyecto_id=proyecto_id)
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado.")
    foto = get_proyecto_foto_by_id(session=session, foto_id=foto_id)
    if not foto or foto.proyecto_id != proyecto_id:
        raise HTTPException(status_code=404, detail="Foto no encontrada.")
    key = delete_proyecto_foto(session=session, db_obj=foto)
    storage.delete_object(key)
    session.refresh(proyecto)
    return proyecto
