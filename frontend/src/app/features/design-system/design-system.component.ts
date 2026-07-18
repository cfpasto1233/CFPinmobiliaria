import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-design-system',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ds-page">
      <!-- Header -->
      <header class="ds-header">
        <div class="ds-container">
          <div class="ds-header-badge">Design System</div>
          <h1>Cfpasto</h1>
          <p class="ds-header-sub">
            Paleta de colores, tipografia, componentes UI y estados interactivos.
          </p>
        </div>
      </header>

      <main class="ds-container ds-main">

        <!-- ================================================================ -->
        <!-- SECCION 1: PALETA DE COLORES                                     -->
        <!-- ================================================================ -->
        <section class="ds-section">
          <h2 class="ds-section-title">Colores</h2>

          <h3 class="ds-subsection">Primarios</h3>
          <div class="ds-swatch-row">
            <div class="ds-swatch" style="background:#081d52"><span>Primary Dark</span><code>#081d52</code></div>
            <div class="ds-swatch" style="background:#0C2C73"><span>Primary</span><code>#0C2C73</code></div>
            <div class="ds-swatch" style="background:#1a4399"><span>Primary Light</span><code>#1a4399</code></div>
          </div>

          <h3 class="ds-subsection">Acento</h3>
          <div class="ds-swatch-row">
            <div class="ds-swatch" style="background:#d48f00"><span>Accent Dark</span><code>#d48f00</code></div>
            <div class="ds-swatch" style="background:#F4A300"><span>Accent</span><code>#F4A300</code></div>
            <div class="ds-swatch" style="background:#f5b733"><span>Accent Light</span><code>#f5b733</code></div>
          </div>

          <h3 class="ds-subsection">Neutros</h3>
          <div class="ds-swatch-row">
            <div class="ds-swatch ds-swatch--light" style="background:#ffffff; border:1px solid #e5e7eb"><span>White</span><code>#ffffff</code></div>
            <div class="ds-swatch ds-swatch--light" style="background:#F2F2F2"><span>BG</span><code>#F2F2F2</code></div>
            <div class="ds-swatch ds-swatch--light" style="background:#fafafa"><span>BG Subtle</span><code>#fafafa</code></div>
            <div class="ds-swatch" style="background:#1a1a2e"><span>Text Dark</span><code>#1a1a2e</code></div>
            <div class="ds-swatch" style="background:#6b7280"><span>Text Muted</span><code>#6b7280</code></div>
            <div class="ds-swatch" style="background:#9ca3af"><span>Text Light</span><code>#9ca3af</code></div>
          </div>

          <h3 class="ds-subsection">Semanticos</h3>
          <div class="ds-swatch-row">
            <div class="ds-swatch" style="background:#059669"><span>Success</span><code>#059669</code></div>
            <div class="ds-swatch" style="background:#ecfdf5; color:#059669"><span>Success BG</span><code>#ecfdf5</code></div>
            <div class="ds-swatch" style="background:#d97706"><span>Warning</span><code>#d97706</code></div>
            <div class="ds-swatch" style="background:#fffbeb; color:#d97706"><span>Warning BG</span><code>#fffbeb</code></div>
            <div class="ds-swatch" style="background:#dc2626"><span>Error</span><code>#dc2626</code></div>
            <div class="ds-swatch" style="background:#fef2f2; color:#dc2626"><span>Error BG</span><code>#fef2f2</code></div>
            <div class="ds-swatch" style="background:#2563eb"><span>Info</span><code>#2563eb</code></div>
            <div class="ds-swatch" style="background:#eff6ff; color:#2563eb"><span>Info BG</span><code>#eff6ff</code></div>
          </div>
        </section>

        <!-- ================================================================ -->
        <!-- SECCION 2: TIPOGRAFIA                                           -->
        <!-- ================================================================ -->
        <section class="ds-section">
          <h2 class="ds-section-title">Tipografia</h2>

          <h3 class="ds-subsection">Outfit — Headings</h3>
          <div class="ds-type-scale">
            <div class="ds-type-row">
              <span class="ds-type-label">H1 — 3rem</span>
              <span class="ds-type-sample" style="font-family:'Outfit';font-size:3rem;font-weight:600;color:#0C2C73">Cfpasto</span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">H2 — 2.25rem</span>
              <span class="ds-type-sample" style="font-family:'Outfit';font-size:2.25rem;font-weight:600;color:#0C2C73">Gestion Agricola</span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">H3 — 1.875rem</span>
              <span class="ds-type-sample" style="font-family:'Outfit';font-size:1.875rem;font-weight:600;color:#0C2C73">Panel de Control</span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">H4 — 1.5rem</span>
              <span class="ds-type-sample" style="font-family:'Outfit';font-size:1.5rem;font-weight:600;color:#0C2C73">Mis Cultivos</span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">H5 — 1.25rem</span>
              <span class="ds-type-sample" style="font-family:'Outfit';font-size:1.25rem;font-weight:600;color:#0C2C73">Resumen del Dia</span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">H6 — 1.125rem</span>
              <span class="ds-type-sample" style="font-family:'Outfit';font-size:1.125rem;font-weight:600;color:#0C2C73">Detalle de Cultivo</span>
            </div>
          </div>

          <h3 class="ds-subsection">Poppins — Body</h3>
          <div class="ds-type-scale">
            <div class="ds-type-row">
              <span class="ds-type-label">Regular 400</span>
              <span class="ds-type-sample" style="font-family:'Poppins';font-weight:400;font-size:1rem;color:#1a1a2e">
                La gestion eficiente de recursos agricolas es clave para el desarrollo sostenible.
              </span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">Medium 500</span>
              <span class="ds-type-sample" style="font-family:'Poppins';font-weight:500;font-size:1rem;color:#1a1a2e">
                La gestion eficiente de recursos agricolas es clave para el desarrollo sostenible.
              </span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">SemiBold 600</span>
              <span class="ds-type-sample" style="font-family:'Poppins';font-weight:600;font-size:1rem;color:#1a1a2e">
                La gestion eficiente de recursos agricolas es clave para el desarrollo sostenible.
              </span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">Bold 700</span>
              <span class="ds-type-sample" style="font-family:'Poppins';font-weight:700;font-size:1rem;color:#1a1a2e">
                La gestion eficiente de recursos agricolas es clave para el desarrollo sostenible.
              </span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">Small — 0.875rem</span>
              <span class="ds-type-sample" style="font-family:'Poppins';font-weight:400;font-size:0.875rem;color:#6b7280">
                Texto auxiliar, notas al pie, metadata.
              </span>
            </div>
            <div class="ds-type-row">
              <span class="ds-type-label">Muted — 0.75rem</span>
              <span class="ds-type-sample" style="font-family:'Poppins';font-weight:400;font-size:0.75rem;color:#9ca3af">
                Texto de soporte, hints, placeholders.
              </span>
            </div>
          </div>
        </section>

        <!-- ================================================================ -->
        <!-- SECCION 3: BOTONES                                               -->
        <!-- ================================================================ -->
        <section class="ds-section">
          <h2 class="ds-section-title">Botones</h2>

          <h3 class="ds-subsection">Primarios</h3>
          <div class="ds-component-row">
            <button class="btn btn-primary btn-sm">Small</button>
            <button class="btn btn-primary">Default</button>
            <button class="btn btn-primary btn-lg">Large</button>
          </div>

          <h3 class="ds-subsection">Secundarios (Acento)</h3>
          <div class="ds-component-row">
            <button class="btn btn-secondary btn-sm">Small</button>
            <button class="btn btn-secondary">Default</button>
            <button class="btn btn-secondary btn-lg">Large</button>
          </div>

          <h3 class="ds-subsection">Outline</h3>
          <div class="ds-component-row">
            <button class="btn btn-outline-primary btn-sm">Primary</button>
            <button class="btn btn-outline-primary">Primary</button>
            <button class="btn btn-outline-secondary btn-sm">Accent</button>
            <button class="btn btn-outline-secondary">Accent</button>
          </div>

          <h3 class="ds-subsection">Semanticos</h3>
          <div class="ds-component-row">
            <button class="btn btn-success">Success</button>
            <button class="btn btn-warning">Warning</button>
            <button class="btn btn-danger">Danger</button>
            <button class="btn btn-info text-white">Info</button>
          </div>

          <h3 class="ds-subsection">Soft (Transparente)</h3>
          <div class="ds-component-row">
            <button class="btn btn-soft-primary">Primary</button>
            <button class="btn btn-soft-accent">Accent</button>
            <button class="btn btn-soft-success">Success</button>
            <button class="btn btn-soft-warning">Warning</button>
            <button class="btn btn-soft-danger">Danger</button>
            <button class="btn btn-soft-info">Info</button>
          </div>

          <h3 class="ds-subsection">Estados</h3>
          <div class="ds-component-row">
            <button class="btn btn-primary">Default</button>
            <button class="btn btn-primary" style="background:#1a4399;border-color:#1a4399">Hover</button>
            <button class="btn btn-primary" style="transform:translateY(1px);background:#081d52;border-color:#081d52">Active</button>
            <button class="btn btn-primary" disabled style="opacity:0.5;cursor:not-allowed">Disabled</button>
          </div>

          <div class="ds-component-row">
            <button class="btn btn-outline-primary">Default</button>
            <button class="btn btn-outline-primary" style="background:#0C2C73;color:#fff">Hover</button>
            <button class="btn btn-outline-primary" style="transform:translateY(1px);background:#081d52;color:#fff">Active</button>
            <button class="btn btn-outline-primary" disabled style="opacity:0.4;cursor:not-allowed">Disabled</button>
          </div>
        </section>

        <!-- ================================================================ -->
        <!-- SECCION 4: FORMULARIOS                                           -->
        <!-- ================================================================ -->
        <section class="ds-section">
          <h2 class="ds-section-title">Formularios</h2>

          <div class="ds-form-grid">
            <div class="ds-form-group">
              <label class="form-label">Nombre completo</label>
              <input type="text" class="form-control" placeholder="Juan Perez">
              <div class="form-text">Nombre y apellido.</div>
            </div>

            <div class="ds-form-group">
              <label class="form-label">Correo electronico</label>
              <input type="email" class="form-control" placeholder="correo&#64;ejemplo.com">
            </div>

            <div class="ds-form-group">
              <label class="form-label">Contrasena</label>
              <input type="password" class="form-control" placeholder="Minimo 8 caracteres">
            </div>

            <div class="ds-form-group">
              <label class="form-label">Telefono</label>
              <input type="tel" class="form-control" placeholder="+57 300 123 4567">
            </div>

            <div class="ds-form-group">
              <label class="form-label">Cultivo</label>
              <select class="form-select">
                <option selected>Seleccionar cultivo...</option>
                <option>Cafe</option>
                <option>Cacao</option>
                <option>Platano</option>
                <option>Arroz</option>
              </select>
            </div>

            <div class="ds-form-group">
              <label class="form-label">Descripcion</label>
              <textarea class="form-control" rows="3" placeholder="Describe tu cultivo..."></textarea>
            </div>

            <div class="ds-form-group">
              <label class="form-label">Campo deshabilitado</label>
              <input type="text" class="form-control" disabled placeholder="No editable">
            </div>

            <div class="ds-form-group">
              <label class="form-label">Campo con error</label>
              <input type="text" class="form-control is-invalid" value="valor invalido">
              <div class="form-error">Este campo es obligatorio.</div>
            </div>
          </div>
        </section>

        <!-- ================================================================ -->
        <!-- SECCION 5: CARDS                                                 -->
        <!-- ================================================================ -->
        <section class="ds-section">
          <h2 class="ds-section-title">Cards</h2>

          <div class="ds-card-grid">
            <div class="card">
              <div class="card-body p-4">
                <h5 style="font-family:'Outfit';color:#0C2C73;margin-bottom:0.5rem">Card Basica</h5>
                <p style="color:#6b7280;font-size:0.875rem;margin:0">
                  Una card simple con contenido de texto y sombra sutil.
                </p>
              </div>
            </div>

            <div class="card">
              <div class="card-header" style="background:#0C2C73;color:#fff;border-radius:0.75rem 0.75rem 0 0">
                <h6 style="margin:0;color:#fff;font-family:'Outfit'">Header</h6>
              </div>
              <div class="card-body p-4">
                <p style="color:#6b7280;font-size:0.875rem;margin:0">
                  Card con header y footer para acciones.
                </p>
              </div>
              <div class="card-footer" style="border-top:1px solid #e5e7eb">
                <small style="color:#9ca3af">Footer de la card</small>
              </div>
            </div>

            <div class="card">
              <div class="card-body p-4 d-flex align-items-center gap-3">
                <div style="width:48px;height:48px;border-radius:12px;background:rgba(12,44,115,0.08);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <span style="font-size:1.25rem">&#127793;</span>
                </div>
                <div>
                  <h6 style="margin:0;font-family:'Outfit';color:#0C2C73">Cultivo Activo</h6>
                  <small style="color:#6b7280">Cafe Araku — 2.5 hectareas</small>
                </div>
              </div>
            </div>

            <div class="card" style="background:#0C2C73;border-color:#0C2C73">
              <div class="card-body p-4">
                <h5 style="font-family:'Outfit';color:#fff;margin-bottom:0.5rem">Card Primaria</h5>
                <p style="color:rgba(255,255,255,0.75);font-size:0.875rem;margin:0">
                  Fondo con el color corporativo para destacar informacion clave.
                </p>
              </div>
            </div>

            <div class="card" style="background:#F4A300;border-color:#F4A300">
              <div class="card-body p-4">
                <h5 style="font-family:'Outfit';color:#1a1a2e;margin-bottom:0.5rem">Card Acento</h5>
                <p style="color:#1a1a2e;font-size:0.875rem;margin:0;opacity:0.8">
                  Fondo con color de acento para alertas o destacados.
                </p>
              </div>
            </div>

            <div class="card">
              <div class="card-body p-4 text-center">
                <div style="width:64px;height:64px;border-radius:16px;background:rgba(5,150,105,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
                  <span style="font-size:1.75rem">&#9989;</span>
                </div>
                <h6 style="font-family:'Outfit';color:#0C2C73">Estado Vacio</h6>
                <p style="color:#9ca3af;font-size:0.8125rem;margin:0">
                  No hay cultivos registrados.<br>Comienza agregando uno nuevo.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- ================================================================ -->
        <!-- SECCION 6: BADGES Y ALERTAS                                      -->
        <!-- ================================================================ -->
        <section class="ds-section">
          <h2 class="ds-section-title">Badges y Alertas</h2>

          <h3 class="ds-subsection">Badges</h3>
          <div class="ds-component-row">
            <span class="badge" style="background:#0C2C73;padding:0.375rem 0.75rem;font-weight:500">Primary</span>
            <span class="badge" style="background:#F4A300;color:#1a1a2e;padding:0.375rem 0.75rem;font-weight:500">Accent</span>
            <span class="badge" style="background:#059669;padding:0.375rem 0.75rem;font-weight:500">Success</span>
            <span class="badge" style="background:#d97706;padding:0.375rem 0.75rem;font-weight:500">Warning</span>
            <span class="badge" style="background:#dc2626;padding:0.375rem 0.75rem;font-weight:500">Error</span>
            <span class="badge" style="background:#2563eb;padding:0.375rem 0.75rem;font-weight:500">Info</span>
          </div>

          <h3 class="ds-subsection">Alertas</h3>
          <div class="ds-alert-stack">
            <div class="alert" style="background:#ecfdf5;border:1px solid #a7f3d0;color:#059669;border-radius:0.5rem;padding:0.875rem 1rem;display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:1.25rem">&#9989;</span>
              <div>
                <strong style="font-weight:600">Exito</strong> — Tu cultivo ha sido registrado correctamente.
              </div>
            </div>
            <div class="alert" style="background:#eff6ff;border:1px solid #bfdbfe;color:#2563eb;border-radius:0.5rem;padding:0.875rem 1rem;display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:1.25rem">&#128161;</span>
              <div>
                <strong style="font-weight:600">Info</strong> — Se ha programado una visita tecnica para el proximo lunes.
              </div>
            </div>
            <div class="alert" style="background:#fffbeb;border:1px solid #fde68a;color:#d97706;border-radius:0.5rem;padding:0.875rem 1rem;display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:1.25rem">&#9888;&#65039;</span>
              <div>
                <strong style="font-weight:600">Advertencia</strong> — El nivel de humedad esta por debajo del umbral recomendado.
              </div>
            </div>
            <div class="alert" style="background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:0.5rem;padding:0.875rem 1rem;display:flex;align-items:center;gap:0.75rem">
              <span style="font-size:1.25rem">&#10060;</span>
              <div>
                <strong style="font-weight:600">Error</strong> — No se pudo sincronizar los datos con el servidor. Intenta de nuevo.
              </div>
            </div>
          </div>
        </section>

        <!-- ================================================================ -->
        <!-- SECCION 7: MODAL DEMO                                            -->
        <!-- ================================================================ -->
        <section class="ds-section">
          <h2 class="ds-section-title">Modal</h2>

          <button class="btn btn-primary" (click)="modalOpen = true">Abrir Modal</button>

          @if (modalOpen) {
            <div class="ds-modal-overlay" (click)="modalOpen = false">
              <div class="ds-modal" (click)="$event.stopPropagation()">
                <div class="ds-modal-header">
                  <h4 style="font-family:'Outfit';color:#0C2C73;margin:0;font-size:1.25rem">Confirmar Accion</h4>
                  <button class="ds-modal-close" (click)="modalOpen = false">&times;</button>
                </div>
                <div class="ds-modal-body">
                  <p style="color:#6b7280;font-size:0.875rem;margin:0">
                    Vas a eliminar el cultivo <strong>"Cafe Araku — Lote 3"</strong>. Esta accion no se puede deshacer.
                  </p>
                </div>
                <div class="ds-modal-footer">
                  <button class="btn btn-outline-secondary" (click)="modalOpen = false">Cancelar</button>
                  <button class="btn btn-danger" (click)="modalOpen = false">Eliminar</button>
                </div>
              </div>
            </div>
          }
        </section>

        <!-- ================================================================ -->
        <!-- SECCION 8: TABLA DE EJEMPLO                                      -->
        <!-- ================================================================ -->
        <section class="ds-section">
          <h2 class="ds-section-title">Tabla</h2>

          <div class="card">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr style="background:#F2F2F2">
                    <th style="font-family:'Outfit';font-weight:600;color:#0C2C73;font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.05em;padding:0.75rem 1rem">Cultivo</th>
                    <th style="font-family:'Outfit';font-weight:600;color:#0C2C73;font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.05em;padding:0.75rem 1rem">Hectareas</th>
                    <th style="font-family:'Outfit';font-weight:600;color:#0C2C73;font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.05em;padding:0.75rem 1rem">Estado</th>
                    <th style="font-family:'Outfit';font-weight:600;color:#0C2C73;font-size:0.8125rem;text-transform:uppercase;letter-spacing:0.05em;padding:0.75rem 1rem">Fecha Siembra</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem">Cafe Araku</td>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem">2.5</td>
                    <td style="padding:0.75rem 1rem"><span class="badge" style="background:#ecfdf5;color:#059669;font-weight:500">Activo</span></td>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem;color:#6b7280">15 Mar 2026</td>
                  </tr>
                  <tr>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem">Cacao CCN-51</td>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem">1.8</td>
                    <td style="padding:0.75rem 1rem"><span class="badge" style="background:#fffbeb;color:#d97706;font-weight:500">En crecimiento</span></td>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem;color:#6b7280">01 Feb 2026</td>
                  </tr>
                  <tr>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem">Platano Harton</td>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem">3.0</td>
                    <td style="padding:0.75rem 1rem"><span class="badge" style="background:#eff6ff;color:#2563eb;font-weight:500">Cosecha</span></td>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem;color:#6b7280">10 Nov 2025</td>
                  </tr>
                  <tr>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem">Arroz IRGA</td>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem">5.2</td>
                    <td style="padding:0.75rem 1rem"><span class="badge" style="background:#fef2f2;color:#dc2626;font-weight:500">Alerta</span></td>
                    <td style="padding:0.75rem 1rem;font-size:0.875rem;color:#6b7280">20 Ene 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      <footer class="ds-footer">
        <div class="ds-container">
          <p>Cfpasto Design System — Outfit + Poppins + Bootstrap 5</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .ds-page {
      min-height: 100vh;
      background: #F2F2F2;
    }

    .ds-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    .ds-main {
      padding-top: 2rem;
      padding-bottom: 4rem;
    }

    /* ─── Header ──────────────────────────────────────────────────── */
    .ds-header {
      background: #0C2C73;
      color: #fff;
      padding: 3rem 0 2.5rem;
    }
    .ds-header h1 {
      font-family: 'Outfit', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      margin: 0.75rem 0 0.5rem;
    }
    .ds-header-badge {
      display: inline-block;
      background: rgba(244,163,0,0.15);
      color: #F4A300;
      font-family: 'Poppins', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      border: 1px solid rgba(244,163,0,0.25);
    }
    .ds-header-sub {
      color: rgba(255,255,255,0.7);
      font-size: 1rem;
      margin: 0.5rem 0 0;
      max-width: 600px;
    }

    /* ─── Sections ────────────────────────────────────────────────── */
    .ds-section {
      margin-bottom: 3rem;
    }
    .ds-section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #0C2C73;
      margin-bottom: 1.25rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e5e7eb;
    }
    .ds-subsection {
      font-family: 'Outfit', sans-serif;
      font-size: 0.9375rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 1.5rem 0 0.75rem;
    }

    /* ─── Swatches ────────────────────────────────────────────────── */
    .ds-swatch-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .ds-swatch {
      width: 120px;
      height: 80px;
      border-radius: 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      color: #fff;
      font-size: 0.6875rem;
    }
    .ds-swatch span {
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
    }
    .ds-swatch code {
      font-family: 'Poppins', sans-serif;
      font-size: 0.625rem;
      opacity: 0.8;
    }
    .ds-swatch--light span,
    .ds-swatch--light code {
      color: #1a1a2e;
    }

    /* ─── Typography ──────────────────────────────────────────────── */
    .ds-type-scale {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .ds-type-row {
      display: flex;
      align-items: baseline;
      gap: 1.5rem;
      padding: 0.625rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .ds-type-label {
      width: 140px;
      flex-shrink: 0;
      font-family: 'Poppins', sans-serif;
      font-size: 0.75rem;
      font-weight: 500;
      color: #9ca3af;
    }
    .ds-type-sample {
      font-family: 'Poppins', sans-serif;
      line-height: 1.3;
    }

    /* ─── Component rows ──────────────────────────────────────────── */
    .ds-component-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    /* ─── Forms ───────────────────────────────────────────────────── */
    .ds-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }
    .ds-form-group {
      display: flex;
      flex-direction: column;
    }

    /* ─── Cards grid ──────────────────────────────────────────────── */
    .ds-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    /* ─── Alert stack ─────────────────────────────────────────────── */
    .ds-alert-stack {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ─── Modal ───────────────────────────────────────────────────── */
    .ds-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
    }
    .ds-modal {
      background: #fff;
      border-radius: 0.75rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      width: 100%;
      max-width: 480px;
      overflow: hidden;
    }
    .ds-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .ds-modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }
    .ds-modal-close:hover {
      color: #1a1a2e;
    }
    .ds-modal-body {
      padding: 1.5rem;
    }
    .ds-modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #fafafa;
    }

    /* ─── Footer ──────────────────────────────────────────────────── */
    .ds-footer {
      background: #0C2C73;
      padding: 1.5rem 0;
      text-align: center;
    }
    .ds-footer p {
      color: rgba(255,255,255,0.6);
      font-size: 0.8125rem;
      margin: 0;
    }
  `],
})
export class DesignSystemComponent {
  modalOpen = false;
}
