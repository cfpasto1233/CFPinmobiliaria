from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import SessionDep
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.crud.user import authenticate
from app.schemas.token import Token

router = APIRouter(tags=["login"])


@router.post("/login/access-token")
def login_access_token(
    request: Request,
    session: SessionDep,
    response: Response,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    remember_me: bool = Query(False),
) -> Token:
    user = authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_expires = timedelta(
        minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES if remember_me else 60 * 24
    )
    refresh_token = create_refresh_token(
        subject=str(user.id), expires_delta=refresh_expires
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT != "local",
        samesite="lax",
        max_age=int(refresh_expires.total_seconds()),
        path="/api/v1/auth",
    )

    return Token(access_token=access_token)
