from fastapi import APIRouter

from app.api.routes import (
    auth,
    campanas,
    citas,
    eventos,
    login,
    logos,
    propiedades,
    proyectos,
    reportes_dano,
    solicitudes_arrendar_propiedad,
    solicitudes_arriendo,
    solicitudes_documentos_propietario,
    solicitudes_publicar_propiedad,
    solicitudes_sugerencias,
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
api_router.include_router(eventos.router)
api_router.include_router(logos.router)
api_router.include_router(campanas.router)
api_router.include_router(citas.router)
api_router.include_router(solicitudes_venta.router)
api_router.include_router(solicitudes_arriendo.router)
api_router.include_router(solicitudes_arrendar_propiedad.router)
api_router.include_router(solicitudes_publicar_propiedad.router)
api_router.include_router(solicitudes_sugerencias.router)
api_router.include_router(solicitudes_documentos_propietario.router)
api_router.include_router(reportes_dano.router)
api_router.include_router(utils.router)
