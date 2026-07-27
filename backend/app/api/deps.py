from typing import Annotated

import jwt
from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.security import ALGORITHM
from app.crud.user import get_user_by_id
from app.models.user import User
from app.schemas.token import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login/access-token"
)

SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        token_data = TokenPayload(**payload)
        if token_data.type != "access":
            raise InvalidTokenError("Not an access token")
    except (InvalidTokenError, ValidationError):
        # 401 (no 403): así el frontend distingue "sesión vencida" (puede refrescar/redirigir
        # a login) de "sin permisos" (usuario válido pero sin rol suficiente).
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No pudimos validar tu sesión. Inicia sesión nuevamente.",
        )
    user = get_user_by_id(session=session, user_id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Tu cuenta está inactiva. Contacta a un administrador.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de superadministrador para realizar esta acción.",
        )
    return current_user


SuperUser = Annotated[User, Depends(get_current_active_superuser)]


def get_refresh_token_from_cookie(
    refresh_token: Annotated[str | None, Cookie(alias="refresh_token")] = None,
) -> str:
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tu sesión expiró. Inicia sesión nuevamente.",
        )
    return refresh_token


RefreshTokenDep = Annotated[str, Depends(get_refresh_token_from_cookie)]
