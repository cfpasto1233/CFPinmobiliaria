import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { whatsappLink } from '../../core/whatsapp/whatsapp.util';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card.component';
import { PublicarWhatsappFabComponent } from '../../shared/components/publicar-whatsapp-fab/publicar-whatsapp-fab.component';
import { CampanaActions } from '../../store/Campana/campana.actions';
import { selectCampanaItem } from '../../store/Campana/campana.selectors';
import { EventosActions } from '../../store/Eventos/eventos.actions';
import { selectEventosItems } from '../../store/Eventos/eventos.selectors';
import { LogosActions } from '../../store/Logos/logos.actions';
import { selectLogosItems } from '../../store/Logos/logos.selectors';
import { PropiedadesActions } from '../../store/Propiedades/propiedades.actions';
import { selectPropiedadesItems } from '../../store/Propiedades/propiedades.selectors';

const ISO_DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

// Por debajo de este número de logos únicos por categoría, la franja se muestra estática
// (sin animar) en vez de arrancar el efecto de scroll infinito.
const MIN_LOGOS_PARA_ANIMAR = 6;

interface RealEstateTip {
  number: string;
  title: string;
  description: string;
}

interface StatsCtaOption {
  question: string;
  actionLabel: string;
  whatsappMessage?: string;
  routerLink?: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, PropertyCardComponent, PublicarWhatsappFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit, AfterViewInit {
  @ViewChild('heroVideo') private readonly heroVideo?: ElementRef<HTMLVideoElement>;

  private readonly store = inject(Store);

  private readonly propiedades = this.store.selectSignal(selectPropiedadesItems);
  protected readonly featuredProperties = computed(() => this.propiedades().slice(0, 4));

  protected readonly campana = this.store.selectSignal(selectCampanaItem);
  protected readonly campanaRango = computed(() => {
    const campana = this.campana();
    if (!campana) return '';
    return `${this.formatDate(campana.fecha_inicio)} – ${this.formatDate(campana.fecha_fin)}`;
  });

  private readonly eventos = this.store.selectSignal(selectEventosItems);
  protected readonly proximosEventos = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.eventos().filter((evento) => this.parseFecha(evento.fecha) >= hoy);
  });

  private readonly logos = this.store.selectSignal(selectLogosItems);
  protected readonly logosAliados = computed(() => this.logos().filter((l) => l.tipo === 'aliado'));
  protected readonly logosInmobiliarias = computed(() =>
    this.logos().filter((l) => l.tipo === 'inmobiliaria'),
  );

  // Menos de este mínimo por categoría, no se anima nada (se ve estático, centrado): con pocos
  // logos únicos el efecto de scroll infinito se ve repetitivo o deja espacio en blanco.
  protected readonly logosAliadosAnimado = computed(
    () => this.logosAliados().length >= MIN_LOGOS_PARA_ANIMAR,
  );
  protected readonly logosInmobiliariasAnimado = computed(
    () => this.logosInmobiliarias().length >= MIN_LOGOS_PARA_ANIMAR,
  );

  protected formatDate(isoDate: string): string {
    return this.parseFecha(isoDate).toLocaleDateString('es-CO', ISO_DATE_FORMAT);
  }

  private parseFecha(isoDate: string): Date {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  ngOnInit(): void {
    this.store.dispatch(PropiedadesActions.load());
    this.store.dispatch(CampanaActions.load());
    this.store.dispatch(EventosActions.load());
    this.store.dispatch(LogosActions.load());
  }

  protected readonly tips: readonly RealEstateTip[] = [
    {
      number: '01',
      title: 'Verifica el estado legal antes de comprar',
      description:
        'El certificado de tradición y libertad debe tener una vigencia no mayor a 30 días. Confirma que no existan embargos, hipotecas, afectaciones familiares ni procesos judiciales. Además, revisa la escritura pública: si el inmueble fue adquirido durante matrimonio o unión libre superior a dos años, la pareja también debe firmar la venta.',
    },
    {
      number: '02',
      title: 'Evalúa vías y servicios cercanos',
      description:
        'La ubicación define la valorización. Estudios inmobiliarios muestran que la cercanía a vías principales, transporte público y servicios como colegios u hospitales puede aumentar el valor de un inmueble entre un 10% y un 25%. Asegúrate de que estos factores se adapten a tus necesidades para garantizar comodidad y proyección de inversión.',
    },
    {
      number: '03',
      title: 'Evalúa los costos adicionales',
      description:
        'Además del precio de venta, ten en cuenta escrituración, registro, notariado, administración y remodelación. Si el inmueble tiene gravámenes como hipoteca, patrimonio de familia, afectación a vivienda o anotaciones judiciales, deben levantarse mediante escritura pública y registro antes de la venta.',
    },
    {
      number: '04',
      title: 'Revisa servicios públicos y cargas ocultas',
      description:
        'Confirma que el inmueble esté al día en servicios públicos como agua, energía, gas y predial. Solicita paz y salvo de administración si es propiedad horizontal. Revisa también posibles servidumbres de paso, restricciones urbanísticas o limitaciones de uso que puedan afectar la explotación futura del inmueble.',
    },
    {
      number: '05',
      title: 'Consulta el POT de tu ciudad',
      description:
        'El Plan de Ordenamiento Territorial define los usos permitidos del suelo. Este análisis es clave si planeas ampliar pisos, cambiar el uso del inmueble o destinarlo a actividades comerciales. La información se obtiene en la Secretaría de Planeación Municipal o en la página oficial de la Alcaldía.',
    },
    {
      number: '06',
      title: 'Analiza la valorización por zonas',
      description:
        'En Pasto, sectores como el Hospital San Pedro registran una valorización superior frente a zonas como San Diego. Según el IGAC y observatorios inmobiliarios, la concentración de servicios, infraestructura vial y demanda residencial explica que estas áreas crezcan hasta un 20% más rápido en valor que otras con menor desarrollo urbano.',
    },
  ];

  protected readonly isArriendosMenuOpen = signal(false);

  protected toggleArriendosMenu(): void {
    this.isArriendosMenuOpen.update((open) => !open);
  }

  protected closeArriendosMenu(): void {
    this.isArriendosMenuOpen.set(false);
  }

  protected readonly isClientesMenuOpen = signal(false);

  protected toggleClientesMenu(): void {
    this.isClientesMenuOpen.update((open) => !open);
  }

  protected closeClientesMenu(): void {
    this.isClientesMenuOpen.set(false);
  }

  protected readonly isPublicarMenuOpen = signal(false);

  protected togglePublicarMenu(): void {
    this.isPublicarMenuOpen.update((open) => !open);
  }

  protected closePublicarMenu(): void {
    this.isPublicarMenuOpen.set(false);
  }

  private readonly expandedTips = signal<ReadonlySet<number>>(new Set());

  protected isTipExpanded(index: number): boolean {
    return this.expandedTips().has(index);
  }

  protected toggleTip(index: number): void {
    this.expandedTips.update((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  protected readonly statsCtaOptions: readonly StatsCtaOption[] = [
    { question: '¿Tienes una propiedad?', actionLabel: 'Publícala aquí', routerLink: '/publicar-propiedad' },
    { question: '¿Buscas casa o apartamento en venta?', actionLabel: 'Ver propiedades', routerLink: '/propiedades' },
    {
      question: '¿Necesitas orientación?',
      actionLabel: 'Pide una asesoría',
      whatsappMessage: 'Hola, quiero pedir una asesoría inmobiliaria.',
    },
  ];

  protected readonly whatsappLink = whatsappLink;

  ngAfterViewInit(): void {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const video = this.heroVideo?.nativeElement;
    if (video && !reducedMotion) {
      // El atributo `muted` del template no siempre se refleja a tiempo como propiedad DOM
      // para que el navegador autorice el autoplay — se fuerza aquí explícitamente.
      video.muted = true;
      video.play().catch(() => {
        // Autoplay bloqueado por el navegador: el poster/overlay queda como fallback visual.
      });
    }
  }
}
