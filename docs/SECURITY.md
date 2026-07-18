# Seguridad — Cfpasto

## Passwords

- Hash irreversible: **Argon2id** con fallback bcrypt (pwdlib)
- Nunca loggear passwords, tokens ni secrets
- Mínimo 1 carácter en backend; mínimo 6 en formulario frontend (ajustar según política)
- Máximo 255 en UI y en Pydantic

## JWT y tokens

- **Access token**: JWT en memoria del cliente JS (no en localStorage ni cookie). 15 min de vida.
- **Refresh token**: httpOnly cookie SameSite=Lax. 7 días. Rotación automática en cada uso.
- **Payload**: solo `sub=user_id`. Sin datos sensibles en el token.
- Refresh token path `/api/v1/auth` — cookie scoped al path de refresh.

## Roles

- `User.is_superuser`: acceso super admin (global, CRUD de todos los usuarios)
- `User.role`: rol de string (`"user"`, `"admin"`) — ampliar según necesidad del negocio
- Usuarios normales: solo acceso a sus propios datos (`/users/me`)

## PII

- Datos de usuario: email, nombre completo
- Evitar logs con PII. No loggear emails en producción a nivel DEBUG
- Archivos almacenados en MinIO (no en filesystem del contenedor)

## Rate limiting

- Login por IP: 5 requests / minuto (slowapi — `@limiter.limit("5/minute")`)
- Endpoints públicos protegidos con límites conservadores
- Para limitar por email (Redis): implementar según patrón de CirculaWeb (`login_limiter.py`)

## Secrets y configuración

- Todos los secrets vía variables de entorno (`.env`)
- `.env` en `.gitignore` — usar `.env.example` como referencia
- `SECRET_KEY` generado con `openssl rand -hex 32` (mínimo 32 chars)
- `MINIO_ROOT_PASSWORD` y `REDIS_PASSWORD` generados aleatoriamente

## CORS

- En producción: solo orígenes en `BACKEND_CORS_ORIGINS`
- En desarrollo: `http://localhost:4200` habilitado vía `compose.override.yml`

## Headers de seguridad

El middleware en `main.py` agrega automáticamente:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (solo en producción)

## Checklist de seguridad para nuevas features

- [ ] ¿El endpoint valida que el usuario autenticado solo accede a sus propios datos?
- [ ] ¿Los inputs tienen `maxlength` en frontend y `max_length` en Pydantic?
- [ ] ¿Los archivos subidos validan tipo MIME y tamaño máximo?
- [ ] ¿Las queries usan parámetros SQLAlchemy (no f-strings) para evitar SQL injection?
- [ ] ¿Los errores HTTP no exponen detalles internos (stack traces, queries) en producción?
- [ ] ¿El nuevo endpoint está protegido con `CurrentUser` o `SuperUser` según corresponda?
- [ ] ¿Los datos de respuesta usan el schema `*Public` (no el modelo ORM directamente)?
