import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { FooterComponent } from '../../layouts/footer/footer.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';

interface FeaturedProperty {
  location: string;
  title: string;
  price: string;
  type: 'venta' | 'arriendo';
}

interface RealEstateTip {
  number: string;
  title: string;
  description: string;
}

interface StatSlide {
  value: string;
  label: string;
  description: string;
}

interface StatsCtaOption {
  question: string;
  actionLabel: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements AfterViewInit, OnDestroy {
  @ViewChild('heroVideo') private readonly heroVideo?: ElementRef<HTMLVideoElement>;

  // Datos visuales de ejemplo: aún no existe módulo de propiedades/backend.
  protected readonly featuredProperties: readonly FeaturedProperty[] = [
    { location: 'Cartagena, Bolívar', title: 'Apartamento Vista al Mar', price: '$450.000.000', type: 'venta' },
    { location: 'Sopó, Cundinamarca', title: 'Casa Campestre con Piscina', price: '$1.200.000.000', type: 'venta' },
    { location: 'Chapinero, Bogotá', title: 'Oficina Centro Empresarial', price: '$4.500.000', type: 'arriendo' },
    { location: 'El Poblado, Medellín', title: 'Penthouse Moderno', price: '$890.000.000', type: 'venta' },
  ];

  protected readonly tips: readonly RealEstateTip[] = [
    {
      number: '01',
      title: 'Verifica el estado legal antes de comprar',
      description:
        'Revisa el certificado de tradición y libertad, y confirma que no existan embargos, hipotecas ni procesos judiciales sobre el inmueble antes de firmar cualquier documento.',
    },
    {
      number: '02',
      title: 'Conoce el avalúo catastral',
      description:
        'El avalúo catastral determina el valor fiscal del inmueble y afecta el impuesto predial. Compáralo con el precio comercial antes de negociar.',
    },
    {
      number: '03',
      title: 'Evalúa los costos adicionales',
      description:
        'Además del precio de venta, considera escrituración, registro, notariado y posibles gastos de administración o remodelación.',
    },
    {
      number: '04',
      title: 'Visita en diferentes horarios',
      description:
        'Recorre la propiedad en distintos momentos del día para evaluar ruido, luz natural, tráfico y seguridad del sector.',
    },
    {
      number: '05',
      title: 'Consulta el POT de tu ciudad',
      description:
        'El Plan de Ordenamiento Territorial define los usos permitidos del suelo; verifica que se ajuste a tus planes de uso o construcción.',
    },
    {
      number: '06',
      title: 'Usa un agente certificado',
      description:
        'Un agente inmobiliario certificado te acompaña en la negociación y la revisión de documentos, protegiendo tus intereses durante todo el proceso.',
    },
  ];

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
      value: '15 años',
      label: 'De experiencia',
      description: 'Desde 2009 acompañamos a familias y empresas a encontrar el inmueble perfecto.',
    },
    {
      value: '32',
      label: 'Ciudades en Colombia',
      description: 'Presencia nacional con agentes especializados en las principales ciudades del país.',
    },
    {
      value: '$0',
      label: 'Costo de asesoría inicial',
      description: 'La primera consulta con nuestros asesores es completamente gratuita y sin compromiso.',
    },
  ];

  protected readonly statsCtaOptions: readonly StatsCtaOption[] = [
    { question: '¿Tienes una propiedad?', actionLabel: 'Publícala gratis' },
    { question: '¿Buscas casa o apartamento?', actionLabel: 'Ver propiedades' },
    { question: '¿Necesitas orientación?', actionLabel: 'Pide una asesoría' },
  ];

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
      this.statAutoplayId = setInterval(() => this.nextStat(), 6000);
    }
  }

  ngOnDestroy(): void {
    if (this.statAutoplayId !== undefined) {
      clearInterval(this.statAutoplayId);
    }
  }
}
