import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { ProjectCardComponent } from '../../shared/components/project-card/project-card.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';
import { ProyectosActions } from '../../store/Proyectos/proyectos.actions';
import { selectProyectosItems, selectProyectosLoading } from '../../store/Proyectos/proyectos.selectors';

@Component({
  selector: 'app-proyectos-listado',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, ProjectCardComponent, PublicarWhatsappFabComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './proyectos-listado.component.html',
  styleUrl: './proyectos-listado.component.scss',
})
export class ProyectosListadoComponent implements OnInit {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(selectProyectosItems);
  protected readonly loading = this.store.selectSignal(selectProyectosLoading);

  ngOnInit(): void {
    this.store.dispatch(ProyectosActions.load());
  }
}
