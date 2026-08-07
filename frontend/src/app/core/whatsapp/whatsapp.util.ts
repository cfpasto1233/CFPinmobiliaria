const WHATSAPP_PHONE = '573176544347';

export function whatsappLink(message: string, phone: string = WHATSAPP_PHONE): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
