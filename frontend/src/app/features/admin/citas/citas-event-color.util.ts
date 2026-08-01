interface CitaEventColor {
  primary: string;
  secondary: string;
}

const ESTADO_COLORS: Record<string, CitaEventColor> = {
  pendiente: { primary: '#d97706', secondary: '#fffbeb' },
  confirmada: { primary: '#059669', secondary: '#ecfdf5' },
  cancelada: { primary: '#dc2626', secondary: '#fef2f2' },
  completada: { primary: '#2563eb', secondary: '#eff6ff' },
};

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada',
};

export function colorForEstado(estado: string): CitaEventColor {
  return ESTADO_COLORS[estado] ?? ESTADO_COLORS['pendiente'];
}

export function labelForEstado(estado: string): string {
  return ESTADO_LABELS[estado] ?? estado;
}
