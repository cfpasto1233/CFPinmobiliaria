import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { FooterComponent } from '../../../layouts/footer/footer.component';
import { NavbarComponent } from '../../../layouts/navbar/navbar.component';
import { ReportesDanoActions } from '../../../store/ReportesDano/reportes-dano.actions';
import { selectReportesDanoFotosView } from '../../../store/ReportesDano/reportes-dano.selectors';

@Component({
  selector: 'app-reporte-dano-fotos',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reporte-dano-fotos.component.html',
  styleUrl: './reporte-dano-fotos.component.scss',
})
export class ReporteDanoFotosComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly meta = inject(Meta);

  protected readonly fotosView = this.store.selectSignal(selectReportesDanoFotosView);

  ngOnInit(): void {
    // Link de un solo uso compartido por WhatsApp — no debe aparecer en buscadores.
    this.meta.addTag({ name: 'robots', content: 'noindex, nofollow' });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.store.dispatch(ReportesDanoActions.loadFotos({ id }));
    }
  }
}
