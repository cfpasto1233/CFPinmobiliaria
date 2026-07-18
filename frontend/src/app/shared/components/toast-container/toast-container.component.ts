import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { NotificationService } from '../../../core/notifications/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 9999">
      @for (toast of notif.toasts(); track toast.id) {
        <div
          class="toast show align-items-center border-0"
          [ngClass]="{
            'text-bg-success': toast.type === 'success',
            'text-bg-danger': toast.type === 'error',
            'text-bg-info': toast.type === 'info',
            'text-bg-warning': toast.type === 'warning'
          }"
          role="alert"
        >
          <div class="d-flex">
            <div class="toast-body">{{ toast.message }}</div>
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              (click)="notif.dismiss(toast.id)"
            ></button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly notif = inject(NotificationService);
}
