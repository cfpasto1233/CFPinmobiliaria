import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError

from app.api.deps import SessionDep, SuperUser
from app.crud.propiedad import (
    add_propiedad_foto,
    create_propiedad,
    delete_propiedad,
    delete_propiedad_foto,
    get_propiedad_by_id,
    get_propiedad_foto_by_id,
    list_propiedades,
    reorder_propiedades,
    replace_foto_principal,
    update_propiedad,
)
from app.schemas.propiedad import (
    PropiedadesPublic,
    PropiedadesReorder,
    PropiedadForm,
    PropiedadPublic,
    PropiedadUpdate,
    TipoInmueble,
    TipoPropiedad,
)
from app.services import storage

router = APIRouter(prefix="/propiedades", tags=["propiedades"])


def _mensaje_error_validacion(exc: ValidationError) -> str:
    return " ".join(error["msg"].removeprefix("Value error, ") for error in exc.errors())


@router.get("/", response_model=PropiedadesPublic)
def read_propiedades(session: SessionDep, skip: int = 0, limit: int = 100) -> PropiedadesPublic:
    items, count = list_propiedades(session=session, skip=skip, limit=limit)
    return PropiedadesPublic(data=list(items), count=count)


@router.patch("/orden", response_model=PropiedadesPublic)
def reorder_propiedades_endpoint(
    session: SessionDep,
    _: SuperUser,
    reorder_in: PropiedadesReorder,
) -> PropiedadesPublic:
    items, count = reorder_propiedades(session=session, ids=reorder_in.ids)
    return PropiedadesPublic(data=list(items), count=count)


@router.get("/{propiedad_id}", response_model=PropiedadPublic)
def read_propiedad_by_id(propiedad_id: uuid.UUID, session: SessionDep) -> PropiedadPublic:
    propiedad = get_propiedad_by_id(session=session, propiedad_id=propiedad_id)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada.")
    return propiedad


@router.post("/", response_model=PropiedadPublic)
def create_propiedad_endpoint(
    session: SessionDep,
    _: SuperUser,
    # Los mismos límites que PropiedadForm, declarados aquí para que FastAPI los valide
    # como parte del request (422 con detalle por campo) antes de construir el schema:
    # si se dejan solo en PropiedadForm, un valor inválido revienta como ValidationError
    # sin capturar dentro del handler y termina en un 500 genérico.
    nombre: Annotated[str, Form(min_length=1, max_length=255)],
    descripcion: Annotated[str, Form(min_length=1)],
    ubicacion: Annotated[str, Form(min_length=1, max_length=255)],
    precio: Annotated[Decimal, Form(gt=0)],
    tipo: Annotated[TipoPropiedad, Form()],
    tipo_inmueble: Annotated[TipoInmueble, Form()],
    foto_principal: Annotated[UploadFile, File()],
    banos: Annotated[int | None, Form(ge=0)] = None,
    habitaciones: Annotated[int | None, Form(ge=0)] = None,
    tiene_parqueadero: Annotated[bool, Form()] = False,
    num_parqueaderos: Annotated[int | None, Form(ge=0)] = None,
    area_construida: Annotated[Decimal | None, Form(gt=0)] = None,
    antiguedad: Annotated[int | None, Form(ge=0)] = None,
) -> PropiedadPublic:
    # baños/habitaciones/área/antigüedad son obligatorios solo si tipo_inmueble es
    # casa o apartamento — esa regla cruzada vive en el model_validator de
    # PropiedadForm y no se puede expresar con Form(), así que se captura acá y se
    # traduce a un 422 con mensaje claro en vez de dejarlo reventar como 500.
    try:
        form = PropiedadForm(
            nombre=nombre,
            descripcion=descripcion,
            ubicacion=ubicacion,
            precio=precio,
            tipo=tipo,
            tipo_inmueble=tipo_inmueble,
            banos=banos,
            habitaciones=habitaciones,
            tiene_parqueadero=tiene_parqueadero,
            num_parqueaderos=num_parqueaderos,
            area_construida=area_construida,
            antiguedad=antiguedad,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=_mensaje_error_validacion(exc)) from exc
    storage.validate_image(foto_principal)
    key = storage.upload_image(foto_principal, folder="propiedades")
    return create_propiedad(session=session, form=form, foto_principal_key=key)


@router.patch("/{propiedad_id}", response_model=PropiedadPublic)
def update_propiedad_endpoint(
    propiedad_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    propiedad_in: PropiedadUpdate,
) -> PropiedadPublic:
    propiedad = get_propiedad_by_id(session=session, propiedad_id=propiedad_id)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada.")
    return update_propiedad(session=session, db_obj=propiedad, obj_in=propiedad_in)


@router.delete("/{propiedad_id}")
def delete_propiedad_endpoint(
    propiedad_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
) -> dict[str, str]:
    propiedad = get_propiedad_by_id(session=session, propiedad_id=propiedad_id)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada.")
    keys = delete_propiedad(session=session, db_obj=propiedad)
    for key in keys:
        storage.delete_object(key)
    return {"message": "Propiedad deleted"}


@router.post("/{propiedad_id}/foto-principal", response_model=PropiedadPublic)
def replace_foto_principal_endpoint(
    propiedad_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    file: Annotated[UploadFile, File()],
) -> PropiedadPublic:
    propiedad = get_propiedad_by_id(session=session, propiedad_id=propiedad_id)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada.")
    storage.validate_image(file)
    key = storage.upload_image(file, folder="propiedades")
    old_key = replace_foto_principal(session=session, propiedad=propiedad, key=key)
    storage.delete_object(old_key)
    return propiedad


@router.post("/{propiedad_id}/fotos", response_model=PropiedadPublic)
def add_foto_endpoint(
    propiedad_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    file: Annotated[UploadFile, File()],
) -> PropiedadPublic:
    propiedad = get_propiedad_by_id(session=session, propiedad_id=propiedad_id)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada.")
    storage.validate_image(file)
    key = storage.upload_image(file, folder="propiedades")
    add_propiedad_foto(session=session, propiedad=propiedad, key=key, orden=len(propiedad.fotos))
    session.refresh(propiedad)
    return propiedad


@router.delete("/{propiedad_id}/fotos/{foto_id}", response_model=PropiedadPublic)
def delete_foto_endpoint(
    propiedad_id: uuid.UUID,
    foto_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
) -> PropiedadPublic:
    propiedad = get_propiedad_by_id(session=session, propiedad_id=propiedad_id)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada.")
    foto = get_propiedad_foto_by_id(session=session, foto_id=foto_id)
    if not foto or foto.propiedad_id != propiedad_id:
        raise HTTPException(status_code=404, detail="Foto no encontrada.")
    key = delete_propiedad_foto(session=session, db_obj=foto)
    storage.delete_object(key)
    session.refresh(propiedad)
    return propiedad
