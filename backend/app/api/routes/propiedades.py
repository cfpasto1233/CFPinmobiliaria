import uuid
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.api.deps import SessionDep, SuperUser
from app.crud.propiedad import (
    add_propiedad_foto,
    create_propiedad,
    delete_propiedad,
    delete_propiedad_foto,
    get_propiedad_by_id,
    get_propiedad_foto_by_id,
    list_propiedades,
    replace_foto_principal,
    update_propiedad,
)
from app.schemas.propiedad import (
    PropiedadesPublic,
    PropiedadForm,
    PropiedadPublic,
    PropiedadUpdate,
    TipoPropiedad,
)
from app.services import storage

router = APIRouter(prefix="/propiedades", tags=["propiedades"])


@router.get("/", response_model=PropiedadesPublic)
def read_propiedades(session: SessionDep, skip: int = 0, limit: int = 100) -> PropiedadesPublic:
    items, count = list_propiedades(session=session, skip=skip, limit=limit)
    return PropiedadesPublic(data=list(items), count=count)


@router.get("/{propiedad_id}", response_model=PropiedadPublic)
def read_propiedad_by_id(propiedad_id: uuid.UUID, session: SessionDep) -> PropiedadPublic:
    propiedad = get_propiedad_by_id(session=session, propiedad_id=propiedad_id)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad not found")
    return propiedad


@router.post("/", response_model=PropiedadPublic)
def create_propiedad_endpoint(
    session: SessionDep,
    _: SuperUser,
    nombre: Annotated[str, Form()],
    descripcion: Annotated[str, Form()],
    ubicacion: Annotated[str, Form()],
    precio: Annotated[Decimal, Form()],
    tipo: Annotated[TipoPropiedad, Form()],
    foto_principal: Annotated[UploadFile, File()],
) -> PropiedadPublic:
    form = PropiedadForm(nombre=nombre, descripcion=descripcion, ubicacion=ubicacion, precio=precio, tipo=tipo)
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
        raise HTTPException(status_code=404, detail="Propiedad not found")
    return update_propiedad(session=session, db_obj=propiedad, obj_in=propiedad_in)


@router.delete("/{propiedad_id}")
def delete_propiedad_endpoint(
    propiedad_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
) -> dict[str, str]:
    propiedad = get_propiedad_by_id(session=session, propiedad_id=propiedad_id)
    if not propiedad:
        raise HTTPException(status_code=404, detail="Propiedad not found")
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
        raise HTTPException(status_code=404, detail="Propiedad not found")
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
        raise HTTPException(status_code=404, detail="Propiedad not found")
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
        raise HTTPException(status_code=404, detail="Propiedad not found")
    foto = get_propiedad_foto_by_id(session=session, foto_id=foto_id)
    if not foto or foto.propiedad_id != propiedad_id:
        raise HTTPException(status_code=404, detail="Foto not found")
    key = delete_propiedad_foto(session=session, db_obj=foto)
    storage.delete_object(key)
    session.refresh(propiedad)
    return propiedad
