import uuid

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=1, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    role: str = Field(default="user", pattern="^(user|admin)$")


class UserUpdate(BaseModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=1, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    role: str | None = Field(default=None, pattern="^(user|admin)$")


class UserPublic(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None
    is_active: bool
    is_superuser: bool
    role: str

    model_config = {"from_attributes": True}


class UsersPublic(BaseModel):
    data: list[UserPublic]
    count: int
