from fastapi import APIRouter

from app.api.routes import (
    auth,
    campanas,
    login,
    propiedades,
    proyectos,
    solicitudes_venta,
    users,
    utils,
)

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(propiedades.router)
api_router.include_router(proyectos.router)
api_router.include_router(campanas.router)
api_router.include_router(solicitudes_venta.router)
api_router.include_router(utils.router)
