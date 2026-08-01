import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
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
import { PropiedadesActions } from '../../store/Propiedades/propiedades.actions';
import { selectPropiedadesItems } from '../../store/Propiedades/propiedades.selectors';

const CAMPANA_DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };

interface RealEstateTip {
  number: string;
  title: string;
  description: string;
}

interface StatSlide {
  value?: string;
  image?: string;
  label: string;
  description?: string;
}

interface StatsCtaOption {
  question: string;
  actionLabel: string;
  whatsappMessage?: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, FooterComponent, RouterLink, PropertyCardComponent, PublicarWhatsappFabComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroVideo') private readonly heroVideo?: ElementRef<HTMLVideoElement>;

  private readonly store = inject(Store);

  private readonly propiedades = this.store.selectSignal(selectPropiedadesItems);
  protected readonly featuredProperties = computed(() => this.propiedades().slice(0, 4));

  protected readonly campana = this.store.selectSignal(selectCampanaItem);
  protected readonly campanaRango = computed(() => {
    const campana = this.campana();
    if (!campana) return '';
    return `${this.formatCampanaDate(campana.fecha_inicio)} – ${this.formatCampanaDate(campana.fecha_fin)}`;
  });

  private formatCampanaDate(isoDate: string): string {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-CO', CAMPANA_DATE_FORMAT);
  }

  ngOnInit(): void {
    this.store.dispatch(PropiedadesActions.load());
    this.store.dispatch(CampanaActions.load());
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

  protected readonly statSlides: readonly StatSlide[] = [
    {
      value: '+1.200',
      label: 'Propiedades vendidas',
      description: 'Cerramos más de mil doscientas operaciones de compraventa en los últimos tres años.',
    },
    {
      value: '98%',
      label: 'Clientes satisfechos',
      description: 'Nuestra tasa de satisfacción nos posiciona como referentes de confianza en el sector.',
    },
    {
      value: '3 años',
      label: 'De experiencia',
      description: 'Acompañamos a las familias desde 2023 con confianza y respaldo.',
    },
    {
      value: '$0',
      label: 'Costo de asesoría inicial',
      description: 'La primera consulta con nuestros asesores es completamente gratuita y sin compromiso.',
    },
    {
      image: 'images/RedInmo.webp',
      label: 'Miembros de la Red Inmobiliaria de Nariño',
    },
    {
      image: 'images/Afianzar.webp',
      label: 'Miembros de Afianzar de Nariño',
      description: 'Con +15 años en el mercado inmobiliario respaldando contratos de arrendamiento.',
    },
    {
      label: 'Soluciones integrales con respaldo legal y público',
      description:
        'Ante entidades como IGAC, SNR y empresas de servicios públicos para respaldar tu propiedad y que todo se encuentre en orden.',
    },
  ];

  protected readonly statsCtaOptions: readonly StatsCtaOption[] = [
    { question: '¿Tienes una propiedad?', actionLabel: 'Publícala aquí' },
    { question: '¿Buscas casa o apartamento?', actionLabel: 'Ver propiedades' },
    {
      question: '¿Necesitas orientación?',
      actionLabel: 'Pide una asesoría',
      whatsappMessage: 'Hola, quiero pedir una asesoría inmobiliaria.',
    },
  ];

  protected readonly whatsappLink = whatsappLink;

  protected readonly activeStatIndex = signal(0);
  private statAutoplayId?: ReturnType<typeof setInterval>;

  protected goToStat(index: number): void {
    this.activeStatIndex.set(index);
  }

  protected nextStat(): void {
    this.activeStatIndex.update((current) => (current + 1) % this.statSlides.length);
  }

  protected prevStat(): void {
    this.activeStatIndex.update((current) => (current - 1 + this.statSlides.length) % this.statSlides.length);
  }

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

    if (!reducedMotion) {
      this.statAutoplayId = setInterval(() => this.nextStat(), 9000);
    }
  }

  ngOnDestroy(): void {
    if (this.statAutoplayId !== undefined) {
      clearInterval(this.statAutoplayId);
    }
  }
}
