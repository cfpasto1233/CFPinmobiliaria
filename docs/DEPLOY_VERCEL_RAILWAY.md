# Despliegue — Vercel (Frontend) + Railway (Backend)

## Arquitectura objetivo

```
[dominio].com            →  Vercel  (Angular frontend)
api.[dominio].com        →  Railway (FastAPI backend)
Railway PostgreSQL       →  DB interna del proyecto Railway
Railway Redis            →  Cache/sesiones interno del proyecto Railway
```

> Reemplazar `[dominio]` con el dominio real de Cfpasto en todo este documento.

---

## PASO 0 — Preparar antes de desplegar

### SECRET_KEY segura
```bash
# Linux/Mac
openssl rand -hex 32

# Windows (PowerShell)
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
```
Guardar el resultado — se necesita en el Paso 4.

### Crear `railway.toml` en la raíz del proyecto

```toml
[build]
dockerfilePath = "backend/Dockerfile"
buildContext = "."

[deploy]
startCommand = "bash /app/backend/scripts/start.sh"
healthcheckPath = "/api/v1/utils/health-check/"
healthcheckTimeout = 60
restartPolicyType = "on_failure"
```

### Commit del railway.toml
```bash
git add railway.toml
git commit -m "chore: add railway.toml for deployment"
git push origin main
```

---

## PASO 1 — Apuntar el frontend al backend de Railway

**Archivo:** `frontend/src/environments/environment.prod.ts`

```typescript
// ANTES (relativo — solo funciona cuando frontend y backend comparten dominio)
export const environment = {
  production: true,
  apiUrl: ''
};

// DESPUÉS (absoluto — necesario cuando están en dominios distintos)
export const environment = {
  production: true,
  apiUrl: 'https://api.[dominio].com'
};
```

Hacer commit y push antes de continuar.

---

## PASO 2 — Desplegar frontend en Vercel

### Configuración inicial

1. Ir a **https://vercel.com** → Login con GitHub
2. **Add New Project** → seleccionar el repositorio de Cfpasto
3. Configurar el proyecto:

| Campo | Valor |
|---|---|
| Framework Preset | Angular |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist/frontend/browser` |
| Install Command | `npm install` |

4. Agregar en **Environment Variables** (Production):

| Variable | Valor |
|---|---|
| `NODE_ENV` | `production` |

5. Click **Deploy**

### Verificar deploy
```
https://[proyecto].vercel.app
```
La landing debe cargar. El login fallará hasta que el backend esté desplegado.

---

## PASO 3 — Crear el proyecto en Railway

1. Ir a **https://railway.app** → Login con GitHub
2. Click **New Project**

### Agregar PostgreSQL
1. **+ New** → **Database** → **Add PostgreSQL**
2. Railway crea el servicio `Postgres` y genera variables:
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

### Agregar Redis
1. **+ New** → **Database** → **Add Redis**
2. Railway crea el servicio `Redis` y genera variables:
   - `REDISHOST`, `REDISPORT`, `REDISPASSWORD`

---

## PASO 4 — Desplegar el backend en Railway

1. En el proyecto Railway → **+ New** → **GitHub Repo** → seleccionar el repositorio
2. Railway detecta el `railway.toml` y configura el build automáticamente

### Variables a configurar en Railway

Ir a la pestaña **Variables** del servicio backend:

#### Base de datos (referenciar el servicio Postgres)
| Variable | Valor |
|---|---|
| `POSTGRES_SERVER` | `${{Postgres.PGHOST}}` |
| `POSTGRES_PORT` | `${{Postgres.PGPORT}}` |
| `POSTGRES_USER` | `${{Postgres.PGUSER}}` |
| `POSTGRES_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `POSTGRES_DB` | `${{Postgres.PGDATABASE}}` |

#### Redis (referenciar el servicio Redis)
| Variable | Valor |
|---|---|
| `REDIS_HOST` | `${{Redis.REDISHOST}}` |
| `REDIS_PORT` | `${{Redis.REDISPORT}}` |
| `REDIS_PASSWORD` | `${{Redis.REDISPASSWORD}}` |
| `REDIS_DB` | `0` |

#### Aplicación
| Variable | Valor |
|---|---|
| `ENVIRONMENT` | `production` |
| `PROJECT_NAME` | `Cfpasto` |
| `SECRET_KEY` | *(resultado del openssl del Paso 0)* |
| `FIRST_SUPERUSER` | *(email del superadmin)* |
| `FIRST_SUPERUSER_PASSWORD` | *(contraseña segura)* |
| `FRONTEND_HOST` | `https://[proyecto].vercel.app` |
| `BACKEND_CORS_ORIGINS` | `https://[proyecto].vercel.app,https://[dominio].com,https://www.[dominio].com` |

#### Email (SMTP)
| Variable | Valor |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_TLS` | `true` |
| `SMTP_USER` | *(email que envía)* |
| `SMTP_PASSWORD` | *(app password de Gmail)* |
| `EMAILS_FROM_EMAIL` | *(email que envía)* |

#### Storage
| Variable | Valor |
|---|---|
| `STORAGE_BACKEND` | `local` |

> **Por qué `local` y no `minio`:** Railway no ofrece MinIO. Con `local`, los archivos se guardan en el filesystem del contenedor. Para producción real con archivos persistentes, migrar a Cloudflare R2 o S3 cambiando solo `STORAGE_BACKEND` y las variables de credenciales.

#### Google Calendar (si se implementa)
| Variable | Valor |
|---|---|
| `GOOGLE_SERVICE_ACCOUNT_JSON` | *(JSON en una sola línea)* |

---

## PASO 5 — Verificar que el deploy funciona

Una vez que Railway termine el build (5-10 minutos la primera vez):

1. Railway asigna una URL temporal: `https://cfpasto-production.up.railway.app`
2. Verificar Swagger UI:
   ```
   https://cfpasto-production.up.railway.app/docs
   ```
3. Verificar health check:
   ```
   https://cfpasto-production.up.railway.app/api/v1/utils/health-check/
   ```
   → Debe devolver `{"status": "ok"}`

### Errores comunes y solución

| Error en logs | Causa | Solución |
|---|---|---|
| `Variable not set` | Falta alguna variable en Railway | Agregar la variable indicada |
| `changethis is not allowed` | SECRET_KEY o password con valor por defecto | Cambiar por valor seguro |
| `Connection refused` (DB) | Variables de Postgres mal referenciadas | Verificar sintaxis `${{Postgres.PGHOST}}` |
| `Connection refused` (Redis) | Variables de Redis faltantes | Agregar variables Redis |
| `Port is not listening` | App no usa `$PORT` | Verificar que `railway.toml` está commiteado |
| `relation 'users' does not exist` | Migraciones no corrieron | Verificar `prestart.sh` en los logs |

---

## PASO 6 — Dominio personalizado para el backend

### En Railway:
1. Servicio backend → **Settings** → **Networking** → **Custom Domain**
2. Escribir: `api.[dominio].com`
3. Railway muestra el valor CNAME a usar

### En el registrador DNS:
| Tipo | Nombre | Valor | TTL |
|---|---|---|---|
| `CNAME` | `api` | *(valor CNAME de Railway)* | 3600 |

Esperar 5-30 minutos para propagación. Verificar:
```
https://api.[dominio].com/docs
https://api.[dominio].com/api/v1/utils/health-check/
```

---

## PASO 7 — Dominio personalizado para el frontend

### En Vercel:
1. Proyecto → **Settings** → **Domains**
2. Agregar: `[dominio].com`
3. Agregar: `www.[dominio].com`
4. Vercel muestra los valores DNS necesarios

### En el registrador DNS:
| Tipo | Nombre | Valor |
|---|---|---|
| `A` | `@` | `76.76.21.21` *(IP de Vercel — verificar en Vercel)* |
| `CNAME` | `www` | `cname.vercel-dns.com` |

---

## PASO 8 — Actualizar CORS y variables con el dominio final

Una vez el dominio propio esté activo, actualizar en Railway:

| Variable | Valor actualizado |
|---|---|
| `FRONTEND_HOST` | `https://[dominio].com` |
| `BACKEND_CORS_ORIGINS` | `https://[dominio].com,https://www.[dominio].com` |

Y en Vercel → **Environment Variables** (Production):

| Variable | Valor actualizado |
|---|---|
| *(si es necesario)* | *(URL del backend final)* |

Hacer **Redeploy** en Vercel para que tome los cambios.

---

## Verificación final end-to-end

```bash
# 1. Health check del backend
curl https://api.[dominio].com/api/v1/utils/health-check/
# Esperado: {"status":"ok"}

# 2. CORS (desde el browser en la URL del frontend)
fetch('https://api.[dominio].com/api/v1/utils/health-check/')
  .then(r => r.json()).then(console.log)
# Esperado: {status: 'ok'} — sin error de CORS
```

**Checklist:**
- [ ] `https://api.[dominio].com/docs` → Swagger carga
- [ ] `https://[dominio].com` → Landing page carga
- [ ] Login con FIRST_SUPERUSER funciona sin errores CORS
- [ ] Redirect a /dashboard tras login correcto
- [ ] Refresh de página mantiene la sesión (cookie httpOnly funciona)

---

## Resumen de archivos a modificar para producción

| Archivo | Cambio |
|---|---|
| `frontend/src/environments/environment.prod.ts` | `apiUrl: 'https://api.[dominio].com'` |
| `railway.toml` | Crear en la raíz (ver Paso 0) |

No se modifica ningún otro archivo del código — toda la configuración de producción va en variables de entorno.
