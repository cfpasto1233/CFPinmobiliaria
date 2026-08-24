export type LegalSlug = 'privacidad' | 'terminos' | 'cookies' | 'habeas-data';

export interface LegalBullet {
  lead?: string;
  text: string;
}

export interface LegalBlock {
  paragraph?: string;
  bullets?: LegalBullet[];
}

export interface LegalDoc {
  eyebrow: string;
  title: string;
  blocks: LegalBlock[];
}

export const LEGAL_CONTENT: Record<LegalSlug, LegalDoc> = {
  privacidad: {
    eyebrow: 'CFP Inmobiliaria · Legal',
    title: 'Política de Privacidad',
    blocks: [
      {
        paragraph:
          'CFP Inmobiliaria protege la información personal de sus clientes, aliados y visitantes ' +
          'conforme a la Ley 1581 de 2012 y demás normas sobre protección de datos en Colombia. Al ' +
          'usar nuestro sitio web o nuestros canales digitales, el usuario autoriza el tratamiento de ' +
          'sus datos personales para los siguientes fines:',
        bullets: [
          { text: 'Gestionar solicitudes, cotizaciones y operaciones inmobiliarias.' },
          {
            text: 'Enviar información comercial, publicitaria o de servicio relacionada con nuestros productos.',
          },
          { text: 'Cumplir obligaciones legales, contractuales y administrativas.' },
          { text: 'Mejorar la experiencia del usuario mediante análisis estadísticos y cookies.' },
        ],
      },
      {
        paragraph:
          'Los datos se almacenan de forma segura y no se comparten con terceros sin autorización ' +
          'previa. El titular puede ejercer sus derechos de acceso, rectificación, cancelación y ' +
          'oposición (ARCO) escribiendo a nuestro correo de contacto o visitando la sección Habeas Data.',
      },
    ],
  },

  terminos: {
    eyebrow: 'CFP Inmobiliaria · Legal',
    title: 'Términos y Condiciones',
    blocks: [
      {
        paragraph:
          'El acceso y uso del sitio web de CFP Inmobiliaria implica la aceptación plena de los ' +
          'siguientes términos:',
        bullets: [
          {
            lead: 'Uso del sitio:',
            text: 'El usuario se compromete a utilizar la información y servicios ofrecidos únicamente con fines legales y personales, absteniéndose de realizar actividades ilícitas o que afecten la seguridad del portal.',
          },
          {
            lead: 'Propiedad intelectual:',
            text: 'Todos los contenidos, marcas, logotipos, textos, imágenes y diseños son propiedad de CFP Inmobiliaria y están protegidos por la legislación vigente. Queda prohibida su reproducción sin autorización expresa.',
          },
          {
            lead: 'Responsabilidad:',
            text: 'CFP Inmobiliaria no se hace responsable por daños derivados del uso indebido del sitio, interrupciones técnicas o información suministrada por terceros.',
          },
          {
            lead: 'Transacciones inmobiliarias:',
            text: 'Toda negociación, contrato o promesa de compraventa se regirá por la legislación colombiana y deberá formalizarse mediante documentos escritos y firmados.',
          },
          {
            lead: 'Modificaciones:',
            text: 'CFP Inmobiliaria podrá actualizar estos términos en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el sitio web.',
          },
          {
            lead: 'Jurisdicción:',
            text: 'Para cualquier controversia se aplicará la legislación colombiana y será competente la jurisdicción de los tribunales de Pasto, Nariño.',
          },
        ],
      },
    ],
  },

  cookies: {
    eyebrow: 'CFP Inmobiliaria · Legal',
    title: 'Política de Cookies',
    blocks: [
      {
        paragraph:
          'CFP Inmobiliaria utiliza cookies y tecnologías similares para mejorar la experiencia de ' +
          'navegación en su sitio web. Las cookies permiten:',
        bullets: [
          { text: 'Recordar preferencias del usuario y facilitar el acceso a contenidos.' },
          {
            text: 'Analizar el tráfico y el comportamiento de navegación para optimizar nuestros servicios.',
          },
          { text: 'Mostrar publicidad personalizada relacionada con nuestros productos inmobiliarios.' },
        ],
      },
      {
        paragraph:
          'El usuario puede aceptar, rechazar o configurar el uso de cookies desde su navegador en ' +
          'cualquier momento. Al continuar navegando en nuestro sitio, se entiende que acepta el uso ' +
          'de cookies conforme a esta política.',
      },
    ],
  },

  'habeas-data': {
    eyebrow: 'CFP Inmobiliaria · Legal',
    title: 'Habeas Data',
    blocks: [
      {
        paragraph:
          'CFP Inmobiliaria garantiza a todos los titulares de datos personales el ejercicio de sus ' +
          'derechos conforme a la Ley 1581 de 2012 y demás normas aplicables en Colombia. El titular ' +
          'de la información podrá en cualquier momento:',
        bullets: [
          { text: 'Acceder a sus datos personales para conocer el tratamiento que se les da.' },
          { text: 'Rectificar la información que sea inexacta, incompleta o desactualizada.' },
          {
            text: 'Cancelar o solicitar la supresión de sus datos cuando considere que no se requiere para la finalidad autorizada.',
          },
          { text: 'Oponerse al tratamiento de sus datos en casos permitidos por la ley.' },
        ],
      },
      {
        paragraph:
          'Para ejercer estos derechos, el titular podrá enviar una solicitud escrita al correo ' +
          'electrónico oficial de CFP Inmobiliaria o radicarla en nuestra oficina en Pasto. Todas las ' +
          'peticiones serán atendidas dentro de los plazos establecidos por la normativa vigente.',
      },
      {
        paragraph:
          'CFP Inmobiliaria se compromete a dar un manejo responsable, seguro y transparente a la ' +
          'información personal, respetando la privacidad y la confianza de nuestros clientes y usuarios.',
      },
    ],
  },
};
