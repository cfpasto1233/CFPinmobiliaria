---
name: Cfpasto
description: Plataforma de gestión para Cfpasto.
colors:
  brand-primary: "#2d6a4f"
  brand-light: "#40916c"
  ink-deep: "#1e293b"
  ink-muted: "#475569"
  surface-page: "#f0f8f4"
  surface-highlight: "#f8fafc"
  surface-green: "#f0fdf4"
  border-soft: "#e2e8f0"
  surface-white: "#ffffff"
  error: "#ef4444"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "10px"
  xl: "16px"
  pill: "50rem"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-solid:
    backgroundColor: "{colors.brand-light}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-solid-hover:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.surface-white}"
  button-outline:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.brand-light}"
    rounded: "{rounded.lg}"
    padding: "12px 24px"
  button-outline-hover:
    backgroundColor: "{colors.surface-green}"
    textColor: "{colors.brand-light}"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Cfpasto

## 1. Overview

**Creative North Star: "La Plataforma que Trabaja"**

Cfpasto no es un portal de consulta. Es una plataforma donde los datos existen en tiempo real y las operaciones se reflejan de inmediato. El sistema visual debe comunicar precisión y confianza: cada pantalla tiene propósito definido, las transiciones de estado son suaves, el acento verde aparece en los momentos de acción.

El registro es doble. La landing pública (brand) habla a quienes no conocen la plataforma; aquí el diseño convence. El dashboard de producto habla a operadores con tareas concretas; aquí el diseño desaparece. El mismo sistema de tokens sirve a ambas superficies, pero la densidad, el ritmo y la cantidad de acento varían. En la landing, el verde puede llevar el 30-40% del peso visual. En el dashboard, es un acento funcional: estado, focus, acción confirmada.

Lo que este sistema rechaza explícitamente: el dashboard genérico de Bootstrap sin identidad; el software con tablas densas y colores planos; la landing SaaS de fondo crema con card-grids idénticas; y el gradient text como decoración. La precisión técnica gana sobre el simbolismo decorativo.

**Key Characteristics:**
- Verde Cfpasto como acento activo, no decorativo
- Fondos claros y limpios — nunca crema/arena, siempre hacia el blanco-verdoso
- Tipografía Inter con contraste de peso claro entre roles
- Cards con sombra ambiental siempre presente, no sólo en hover
- Animaciones de estado suaves (250ms ease-out), nunca ornamentales
- Densidad legible: el dashboard muestra datos, no whitespace

## 2. Colors: La Paleta Cfpasto

El sistema usa un único acento cromático (Verde Cfpasto) sobre una base de neutrales pizarra ligeramente fríos. No hay colores secundarios de marca; el contraste viene de la posición y el peso, no de múltiples acentos.

### Primary
- **Verde Cfpasto** (`#2d6a4f`): El acento del sistema. Focus rings de inputs, bordes activos, highlights de datos. Este color nunca decora: aparece en respuesta a un estado o acción.
- **Verde Claro** (`#40916c`): Variante más luminosa, usada en CTAs principales (botón sólido de la landing, texto de badges de marca). Adecuado para tipografía de acento y elementos interactivos de primer nivel.

### Neutral
- **Pizarra Profunda** (`#1e293b`): Color de texto principal en toda la app. Nunca puro negro.
- **Pizarra Media** (`#475569`): Texto secundario, subtítulos, descripciones de formulario. Cumple 4.5:1 sobre todos los fondos del sistema.
- **Niebla Verde** (`#f0f8f4`): Fondo de la landing pública. Verde muy sutil que distingue la surface de landing del blanco puro.
- **Superficie Limpia** (`#f8fafc`): Fondo de secciones de dashboard y thead de tablas.
- **Verde Pálido** (`#f0fdf4`): Hover de filas de tabla, fondos de badges, pills de estado.
- **Borde Suave** (`#e2e8f0`): Bordes de cards, inputs, divisores. El único borde estándar del sistema.
- **Blanco Puro** (`#ffffff`): Fondo de cards, modales, inputs, sidebar.
- **Error** (`#ef4444`): Estados de error en formularios. Único color semántico fuera del sistema verde.

### Named Rules
**La Regla del Acento Único.** El Verde Cfpasto aparece en ≤15% de la superficie de cualquier pantalla del dashboard. Su escasez funcional es lo que lo hace visible cuando importa.

**La Regla Sin Crema.** Los fondos de página nunca llevan temperatura cálida. El sistema usa `#f0f8f4` y `#f8fafc` (ligeramente fríos) o blanco puro.

## 3. Typography

**Display / Body Font:** Inter (system-ui, -apple-system, sans-serif como fallback)

**Character:** Una sola familia sans-serif moderna en múltiples pesos. El contraste tipográfico viene del peso y el tamaño, nunca de familias mixtas.

### Hierarchy
- **Display** (700, clamp(2rem, 5vw, 3.5rem), lh 1.1, ls -0.02em): Sólo en héroes de la landing.
- **Headline** (600, 1.75rem, lh 1.2, ls -0.01em): Títulos de sección en la landing, encabezados de página en el dashboard.
- **Title** (600, 1.25rem, lh 1.3): Títulos de card, encabezados de tabla. El peso 600 es obligatorio aquí.
- **Body** (400, 1rem, lh 1.6): Todo el texto de contenido.
- **Label** (600, 0.75rem, lh 1.4, ls 0.01em): Etiquetas de campo, encabezados de columna, badges. Mayúsculas prohibidas en labels de más de 4 palabras.

### Named Rules
**La Regla del Peso.** Nunca usar 400 donde se necesita jerarquía. Si algo parece "apagado", la solución es subir el peso a 600 o 700, no bajar el tamaño o cambiar el color.

## 4. Elevation

El sistema usa sombra ambiental siempre presente en las cards del dashboard: `0 8px 32px rgba(30,41,59,0.06)`. Esta sombra es permanente (no sólo en hover) y comunica capas sin drama.

### Shadow Vocabulary
- **Ambient Card** (`box-shadow: 0 8px 32px rgba(30,41,59,0.06)`): Cards del dashboard, siempre.
- **Surface Subtle** (`box-shadow: 0 1px 2px rgba(56,65,74,0.15)`): Dropdowns, tooltips, inputs activos.
- **Lift** (`box-shadow: 0 5px 10px rgba(30,32,37,0.12)`): Modales, menús desplegables elevados.
- **Focus Ring** (`box-shadow: 0 0 0 0.2rem rgba(45,106,79,0.18)`): Inputs en foco. Usa el RGB del Verde Cfpasto.
- **Error Ring** (`box-shadow: 0 0 0 0.2rem rgba(239,68,68,0.15)`): Inputs en estado de error.
- **CTA Glow** (`box-shadow: 0 6px 16px rgba(45,106,79,0.3)`): Botón sólido de la landing en reposo.

### Named Rules
**La Regla Plana-en-Contenido.** Dentro de una card, los elementos no tienen sombra propia. Inputs dentro de cards tienen `border` como delimitador, no `box-shadow` de elevación.

## 5. Components

### Buttons

Forma limpia y confiante (border-radius 10px, padding 12px 24px, font-size 13.5px, font-weight 600). Transición multi-propiedad a 250ms ease, incluyendo `transform: translateY(-2px)` en hover.

- **Sólido (CTA principal):** Fondo `#40916c`, texto blanco. Usado para acciones primarias de la landing y acciones de creación en el dashboard.
- **Outline (acción secundaria):** Fondo blanco, borde `#e2e8f0`, texto `#40916c`. En hover, fondo pasa a `#f0fdf4`.
- **Soft variants (dashboard):** `btn-soft-secondary` para Editar, `btn-soft-danger` para Eliminar, `btn-soft-primary` para acciones contextuales.
- **Primary / Success (dashboard):** btn-success siempre para Agregar/Crear.

### Cards / Containers

border-radius 16px, overflow hidden (obligatorio para respetar el radio en contenidos tabulares), sombra ambient card siempre presente. Borde `#e2e8f0` de 1px. Fondo blanco puro.

Cards en el dashboard nunca están anidadas. Si se necesita sub-agrupación dentro de una card, se usa un `div` con fondo `#f8fafc` y borde `#e2e8f0`, sin sombra propia.

### Inputs / Fields

Borde `#e2e8f0` de 1px, fondo blanco, color `#1e293b`, border-radius 4px, placeholder `#adb5bd`. En focus: borde cambia a `#2d6a4f`, focus ring verde `0 0 0 0.2rem rgba(45,106,79,0.18)`. En error: borde `#ef4444`, ring rojo.

`ng-select` sigue el mismo esquema visual que los inputs nativos. Siempre con `[appendTo]="'body'"` en modales.

### Data Grid (componente característico)

Tabla envuelta en card con `card-body p-0`. El `.card` padre necesita `overflow: hidden`. `thead.table-light th` usa fondo `#f8fafc` y texto `#1e293b`. Filas en hover: fondo `#f0fdf4`.

## 6. Do's and Don'ts

### Do:
- **Usar `var(--cfpasto-*)` para todos los colores de marca.** Los tokens de `:root` son la fuente de verdad.
- **Dar a cada card del dashboard `overflow: hidden` en su SCSS propio.**
- **Usar `transform: translateY(-2px)` como señal de hover en botones CTA.**
- **Mantener la sombra ambient card siempre presente.** `0 8px 32px rgba(30,41,59,0.06)` es la sombra de reposo.
- **Incluir `@media (prefers-reduced-motion: reduce)` en todas las animaciones.**
- **Usar ng-select con `[appendTo]="'body'"` en todos los selects dentro de modales.**

### Don't:
- **No usar fondos de color cálido** (crema, arena, beige, papel) en ningún contexto.
- **No hacer card grids idénticas** con icon + heading + texto repetido en la landing.
- **No usar eyebrows de sección** en todas las secciones de la landing.
- **No usar gradient text** (`background-clip: text` con gradiente). Prohibido en toda la app.
- **No usar `border-left` > 1px como franja de color decorativa** en cards, alertas o items de lista.
- **No anidar cards.** Una card dentro de otra card es siempre incorrecto.
- **No despachar actions HTTP directamente desde componentes.** Los componentes sólo leen el store via `selectSignal` y despachan actions. La lógica HTTP vive en Effects.
