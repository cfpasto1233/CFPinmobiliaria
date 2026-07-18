# Frontend Guide — Angular + ng-openapi (Cfpasto)

## Stack

- Angular 21 standalone + Signals + OnPush
- NgRx clásico (store/Authentication como base)
- Bootstrap 5.3
- ng-openapi para cliente HTTP generado
- Node.js 20+ como gestor de paquetes

## Reglas

- Componentes **standalone** siempre (sin `NgModule`)
- **ChangeDetectionStrategy.OnPush** en todos los componentes
- **Signals** para estado local (`signal`, `computed`, `effect`)
- NO editar `frontend/src/client/` manualmente (generado por ng-openapi)

## Estructura

```
frontend/src/
├── app/
│   ├── app.ts              # App root component
│   ├── app.config.ts       # providers (router, store, http, effects)
│   ├── app.routes.ts       # rutas lazy
│   ├── core/
│   │   ├── auth/           # guards, interceptors, auth.service, auth-token
│   │   └── notifications/  # NotificationService
│   ├── features/
│   │   ├── landing/        # Landing (sin auth)
│   │   ├── dashboard/      # Dashboard (requiere auth)
│   │   └── auth/           # login, register
│   ├── layouts/            # Layout components (sidebar, topbar, etc.)
│   ├── shared/components/  # Toast, modales, componentes reutilizables
│   └── store/
│       ├── Authentication/ # actions, effects, reducer, selectors (auth)
│       └── index.ts        # rootReducer, RootReducerState
└── client/                 # generado por ng-openapi (NO editar)
```

## Generación del cliente HTTP

```bash
# Requiere backend corriendo en localhost:8000
bash scripts/generate-client.sh
```

Esto genera `frontend/src/client/` con:
- `models/` — interfaces TypeScript de los schemas Pydantic
- `services/` — Angular services con métodos tipados por endpoint
- `providers.ts` — `provideDefaultClient()` para `app.config.ts`

## Rutas de la app

| Ruta | Componente | Auth requerida |
|---|---|---|
| `/` | Landing | No |
| `/auth/login` | LoginComponent | No |
| `/auth/register` | RegisterComponent | No |
| `/dashboard` | DashboardComponent | Sí |

## Notificaciones

```typescript
import { NotificationService } from '../../core/notifications/notification.service';

private notif = inject(NotificationService);

this.notif.success('Operación exitosa.');
this.notif.error('Error al procesar la solicitud.');
this.notif.info('Información relevante.');
this.notif.warning('Advertencia.');
```

## Auth Service

```typescript
import { AuthService } from '../../core/auth/auth.service';

readonly auth = inject(AuthService);

// Señales disponibles:
auth.user()            // UserInfo | null
auth.isAuthenticated() // boolean
auth.isSuperAdmin()    // boolean
auth.isLoading()       // boolean
```

## Store NgRx

### Regla general

**Todo dato que provenga del backend debe vivir en el store, no en el componente.**

| ¿Dónde va? | Criterio |
|---|---|
| **Store** | Datos de API, loading state, error state de llamadas HTTP |
| **Local (`signal`)** | Estado puro de UI: toggles de visibilidad, modales, validación de formulario |

Un componente que necesite datos del backend **nunca** inyecta un Service directamente para hacer HTTP. Despacha una action y lee del store con `selectSignal`.

### Stores disponibles

| Store | Feature key | Sub-estados |
|---|---|---|
| `Authentication` | `auth` | `user`, `loading`, `error`, `initialized` |

### Estructura de archivos de un store

```
store/NombreFeature/
├── nombre-feature.actions.ts   → createAction con props
├── nombre-feature.reducer.ts   → createReducer con on()
├── nombre-feature.selectors.ts → createFeatureSelector + createSelector
└── nombre-feature.effects.ts   → @Injectable() class con createEffect
```

Registrar en `store/index.ts` y `app.config.ts`:

```typescript
// store/index.ts
export interface RootReducerState {
  auth: AuthState;
  miFeature: MiFeatureState;  // agregar aquí
}
export const rootReducer = {
  auth: authReducer,
  miFeature: miFeatureReducer,  // agregar aquí
};

// app.config.ts
provideEffects([AuthenticationEffects, MiFeatureEffects]),
```

### Patrón de un store completo

**actions.ts**
```typescript
import { createAction, props } from '@ngrx/store';

export const loadItems = createAction('[MiFeature] Load Items');
export const loadItemsSuccess = createAction(
  '[MiFeature] Load Items Success',
  props<{ items: MiEntidadPublic[] }>(),
);
export const loadItemsFailure = createAction('[MiFeature] Load Items Failure');
export const createItem = createAction(
  '[MiFeature] Create Item',
  props<{ payload: MiEntidadCreate }>(),
);
```

**reducer.ts**
```typescript
import { createReducer, on } from '@ngrx/store';
import * as Actions from './mi-feature.actions';

export interface MiFeatureState {
  items: MiEntidadPublic[];
  loading: boolean;
  error: boolean;
}

const initialState: MiFeatureState = { items: [], loading: false, error: false };

export const miFeatureReducer = createReducer(
  initialState,
  on(Actions.loadItems, (state) => ({ ...state, loading: true, error: false })),
  on(Actions.loadItemsSuccess, (state, { items }) => ({ ...state, items, loading: false })),
  on(Actions.loadItemsFailure, (state) => ({ ...state, loading: false, error: true })),
);
```

**selectors.ts**
```typescript
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MiFeatureState } from './mi-feature.reducer';

export const selectMiFeature = createFeatureSelector<MiFeatureState>('miFeature');
export const selectItems = createSelector(selectMiFeature, (s) => s.items);
export const selectLoading = createSelector(selectMiFeature, (s) => s.loading);
```

**effects.ts**
```typescript
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { MiEntidadService } from '../../../client/services';
import * as MiFeatureActions from './mi-feature.actions';

@Injectable()
export class MiFeatureEffects {
  private readonly actions$ = inject(Actions);
  private readonly service = inject(MiEntidadService);

  loadItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MiFeatureActions.loadItems),
      switchMap(() =>
        this.service.miEntidadListEndpoint().pipe(
          map(({ data }) => MiFeatureActions.loadItemsSuccess({ items: data })),
          catchError(() => of(MiFeatureActions.loadItemsFailure())),
        ),
      ),
    ),
  );
}
```

### Uso en un componente

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class MiListaComponent implements OnInit {
  private readonly store = inject(Store);

  readonly items = this.store.selectSignal(selectItems);
  readonly loading = this.store.selectSignal(selectLoading);

  ngOnInit(): void {
    this.store.dispatch(MiFeatureActions.loadItems());
  }
}
```

Template:
```html
@if (loading()) {
  <div class="text-center py-5">
    <div class="spinner-border text-success"></div>
  </div>
} @else if (items().length === 0) {
  <div class="text-center py-5 text-muted">Sin registros.</div>
} @else {
  <div class="card border-0 shadow-sm">
    <div class="card-body p-0">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr><th>Nombre</th></tr>
        </thead>
        <tbody>
          @for (item of items(); track item.id) {
            <tr><td>{{ item.nombre }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  </div>
}
```

### Operadores RxJS en effects

| Operador | Cuándo usarlo |
|---|---|
| `exhaustMap` | Acciones que no deben repetirse mientras hay una en curso (submit de formulario) |
| `switchMap` | Acciones que cancelan la petición anterior (búsquedas) |
| `mergeMap` | Acciones independientes por id (operaciones paralelas) |

### Effects de solo side-effects (sin dispatch)

```typescript
onFailure$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(MiFeatureActions.loadItemsFailure),
      tap(() => this.notif.error('Error al cargar los datos.')),
    ),
  { dispatch: false },
);
```

---

## Sistema de estilos

### Arquitectura SCSS

```
frontend/src/assets/scss/
├── bootstrap.scss        # Importa Bootstrap
├── app.scss              # Variables y estilos globales de Cfpasto
src/styles.scss           # Reset y base global
```

### Tokens de diseño Cfpasto

Definir en `assets/scss/app.scss` y publicar como CSS custom properties en `:root`:

```scss
/* _variables.scss */
$cfpasto-primary:        #2d6a4f;
$cfpasto-brand-text:     #40916c;
$cfpasto-text-dark:      #1e293b;
$cfpasto-text-muted:     #475569;
$cfpasto-bg-subtle:      #f0f8f4;
$cfpasto-highlight-bg:   #f8fafc;
$cfpasto-bg-green:       #f0fdf4;
$cfpasto-border-subtle:  #e2e8f0;

/* custom.scss — publicar en :root */
:root {
  --cfpasto-primary:        #{$cfpasto-primary};
  --cfpasto-primary-rgb:    #{red($cfpasto-primary)}, #{green($cfpasto-primary)}, #{blue($cfpasto-primary)};
  --cfpasto-brand-text:     #{$cfpasto-brand-text};
  --cfpasto-text-dark:      #{$cfpasto-text-dark};
  --cfpasto-text-muted:     #{$cfpasto-text-muted};
  --cfpasto-bg-subtle:      #{$cfpasto-bg-subtle};
  --cfpasto-highlight-bg:   #{$cfpasto-highlight-bg};
  --cfpasto-bg-green:       #{$cfpasto-bg-green};
  --cfpasto-border-subtle:  #{$cfpasto-border-subtle};
}
```

### Usar tokens en componentes

```scss
/* mi-componente.scss — no se necesita @import */
.mi-titulo {
  color: var(--cfpasto-text-dark);
}

.mi-badge {
  background-color: var(--cfpasto-bg-green);
  border: 1px solid rgba(var(--cfpasto-primary-rgb), 0.2);
  color: var(--cfpasto-brand-text);
}
```

---

## Patrón de tabla en el dashboard

```html
<div class="card border-0 shadow-sm">
  <div class="card-body p-0">
    <div class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Columna 1</th>
            <th>Columna 2</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (item of items(); track item.id) {
            <tr>
              <td>{{ item.campo1 }}</td>
              <td>{{ item.campo2 }}</td>
              <td>
                <button class="btn btn-sm btn-soft-secondary me-1">Editar</button>
                <button class="btn btn-sm btn-soft-danger">Eliminar</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  </div>
</div>
```

SCSS obligatorio en el componente:

```scss
:host { display: block; }

.card {
  border-radius: 16px;
  overflow: hidden; /* obligatorio para respetar el border-radius con tablas */
  box-shadow: 0 8px 32px rgba(30, 41, 59, 0.06);
}
```

---

## Convención de botones

| Acción | Clase CSS |
|---|---|
| Agregar / Crear / Nuevo | `btn-success` |
| Editar | `btn-soft-secondary` |
| Eliminar | `btn-soft-danger` |
| Navegación / Acción contextual | `btn-primary` / `btn-soft-primary` |
| Cancelar / Volver | `btn-soft-danger` / `btn-light` |

## Patrón de filtros en tabla

```typescript
// UI state — signals locales, no van al store
readonly searchTerm = signal('');

readonly filteredItems = computed(() => {
  const term = this.searchTerm().toLowerCase().trim();
  return this.items().filter((item) =>
    !term || item.nombre.toLowerCase().includes(term)
  );
});
```

```html
<input
  type="text"
  class="form-control form-control-sm"
  placeholder="Buscar..."
  [value]="searchTerm()"
  (input)="searchTerm.set($any($event.target).value)"
/>
```

## Password con toggle visibility

```html
<div class="position-relative">
  <input
    [type]="showPassword() ? 'text' : 'password'"
    class="form-control pe-5"
    formControlName="password"
  />
  <button
    class="btn btn-link position-absolute end-0 top-0 text-muted"
    type="button"
    (click)="showPassword.set(!showPassword())"
  >
    <i class="mdi" [class.mdi-eye-outline]="showPassword()" [class.mdi-eye-off-outline]="!showPassword()"></i>
  </button>
</div>
```
