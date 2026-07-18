import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  info(message: string): void {
    this.add(message, 'info');
  }

  warning(message: string): void {
    this.add(message, 'warning');
  }

  dismiss(id: number): void {
    this.toasts.update((ts) => ts.filter((t) => t.id !== id));
  }

  private add(message: string, type: Toast['type']): void {
    const id = ++this._counter;
    this.toasts.update((ts) => [...ts, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
