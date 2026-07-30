from fastapi import APIRouter

from app.api.deps import SessionDep, SuperUser
from app.crud.campana import get_campana, upsert_campana
from app.schemas.campana import CampanaForm, CampanaOut, CampanaPublic

router = APIRouter(prefix="/campanas", tags=["campanas"])


@router.get("/", response_model=CampanaOut)
def read_campana(session: SessionDep) -> CampanaOut:
    return CampanaOut(data=get_campana(session=session))


@router.put("/", response_model=CampanaPublic)
def upsert_campana_endpoint(
    session: SessionDep,
    _: SuperUser,
    campana_in: CampanaForm,
) -> CampanaPublic:
    return upsert_campana(session=session, form=campana_in)
