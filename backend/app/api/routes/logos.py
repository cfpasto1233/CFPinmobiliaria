import uuid
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.api.deps import SessionDep, SuperUser
from app.crud.logo import (
    create_logo,
    delete_logo,
    get_logo_by_id,
    list_logos,
    replace_imagen,
    update_logo,
)
from app.schemas.logo import LogoForm, LogoPublic, LogosPublic, LogoUpdate, TipoLogo
from app.services import storage

router = APIRouter(prefix="/logos", tags=["logos"])


@router.get("/", response_model=LogosPublic)
def read_logos(session: SessionDep, skip: int = 0, limit: int = 100) -> LogosPublic:
    items, count = list_logos(session=session, skip=skip, limit=limit)
    return LogosPublic(data=list(items), count=count)


@router.post("/", response_model=LogoPublic)
def create_logo_endpoint(
    session: SessionDep,
    _: SuperUser,
    nombre: Annotated[str, Form(min_length=1, max_length=255)],
    tipo: Annotated[TipoLogo, Form()],
    imagen: Annotated[UploadFile, File()],
) -> LogoPublic:
    form = LogoForm(nombre=nombre, tipo=tipo)
    storage.validate_image(imagen)
    key = storage.upload_image(imagen, folder="logos")
    return create_logo(session=session, form=form, imagen_key=key)


@router.patch("/{logo_id}", response_model=LogoPublic)
def update_logo_endpoint(
    logo_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    logo_in: LogoUpdate,
) -> LogoPublic:
    logo = get_logo_by_id(session=session, logo_id=logo_id)
    if not logo:
        raise HTTPException(status_code=404, detail="Logo no encontrado.")
    return update_logo(session=session, db_obj=logo, obj_in=logo_in)


@router.delete("/{logo_id}")
def delete_logo_endpoint(
    logo_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
) -> dict[str, str]:
    logo = get_logo_by_id(session=session, logo_id=logo_id)
    if not logo:
        raise HTTPException(status_code=404, detail="Logo no encontrado.")
    key = delete_logo(session=session, db_obj=logo)
    storage.delete_object(key)
    return {"message": "Logo deleted"}


@router.post("/{logo_id}/imagen", response_model=LogoPublic)
def replace_imagen_endpoint(
    logo_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    file: Annotated[UploadFile, File()],
) -> LogoPublic:
    logo = get_logo_by_id(session=session, logo_id=logo_id)
    if not logo:
        raise HTTPException(status_code=404, detail="Logo no encontrado.")
    storage.validate_image(file)
    key = storage.upload_image(file, folder="logos")
    old_key = replace_imagen(session=session, logo=logo, key=key)
    storage.delete_object(old_key)
    return logo
