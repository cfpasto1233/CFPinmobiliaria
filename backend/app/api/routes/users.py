import uuid

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select

from app.api.deps import CurrentUser, SessionDep, SuperUser
from app.crud.user import create_user, get_user_by_email, update_user
from app.models.user import User
from app.schemas.user import UserCreate, UserPublic, UserUpdate, UsersPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def read_user_me(current_user: CurrentUser) -> UserPublic:
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    session: SessionDep,
    user_in: UserUpdate,
    current_user: CurrentUser,
) -> UserPublic:
    if user_in.email:
        existing = get_user_by_email(session=session, email=user_in.email)
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=409, detail="Email already in use")
    return update_user(session=session, db_user=current_user, user_in=user_in)


@router.get("/", response_model=UsersPublic)
def read_users(
    session: SessionDep,
    _: SuperUser,
    skip: int = 0,
    limit: int = 100,
) -> UsersPublic:
    count = session.scalar(select(func.count()).select_from(User))
    users = session.scalars(select(User).offset(skip).limit(limit)).all()
    return UsersPublic(data=list(users), count=count or 0)


@router.post("/", response_model=UserPublic)
def create_user_endpoint(
    session: SessionDep,
    _: SuperUser,
    user_in: UserCreate,
) -> UserPublic:
    existing = get_user_by_email(session=session, email=user_in.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    return create_user(session=session, user_create=user_in)


@router.get("/{user_id}", response_model=UserPublic)
def read_user_by_id(
    user_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
) -> UserPublic:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserPublic)
def update_user_endpoint(
    user_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    user_in: UserUpdate,
) -> UserPublic:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user_in.email:
        existing = get_user_by_email(session=session, email=user_in.email)
        if existing and existing.id != user_id:
            raise HTTPException(status_code=409, detail="Email already in use")
    return update_user(session=session, db_user=user, user_in=user_in)


@router.delete("/{user_id}")
def delete_user(
    user_id: uuid.UUID,
    session: SessionDep,
    current_user: SuperUser,
) -> dict[str, str]:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    session.delete(user)
    session.commit()
    return {"message": "User deleted"}
