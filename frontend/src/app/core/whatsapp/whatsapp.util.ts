const WHATSAPP_PHONE = '573176544347';

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
