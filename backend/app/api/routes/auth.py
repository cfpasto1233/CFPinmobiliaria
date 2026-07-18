from datetime import timedelta

import jwt
from fastapi import APIRouter, HTTPException, Response, status
from jwt.exceptions import InvalidTokenError

from app.api.deps import CurrentUser, RefreshTokenDep, SessionDep
from app.core.config import settings
from app.core.security import ALGORITHM, create_access_token
from app.crud.user import get_user_by_id
from app.schemas.token import Token, TokenPayload

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/refresh")
def refresh_token(
    session: SessionDep,
    response: Response,
    token: RefreshTokenDep,
) -> Token:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        token_data = TokenPayload(**payload)
        if token_data.type != "refresh":
            raise InvalidTokenError("Not a refresh token")
    except (InvalidTokenError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    user = get_user_by_id(session=session, user_id=token_data.sub)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    access_token = create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token)


@router.post("/logout")
def logout(response: Response, _: CurrentUser) -> dict[str, str]:
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")
    return {"message": "Logged out successfully"}
