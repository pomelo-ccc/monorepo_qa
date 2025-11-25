import {
  Component,
  Injectable,
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  createComponent,
  Input,
  OnInit,
  inject,
  EmbeddedViewRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'lib-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="message-container" [class]="type" [class.show]="show">
      <div class="icon">
        @if (type === 'success') {
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        }
        @if (type === 'error') {
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        }
        @if (type === 'warning') {
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        }
        @if (type === 'info') {
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        }
      </div>
      <span class="content">{{ content }}</span>
    </div>
  `,
  styles: [
    `
      .message-container {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100%);
        padding: 10px 20px;
        border-radius: 8px;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        min-width: 300px;
        max-width: 80%;
      }

      .message-container.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }

      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .content {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }

      /* Types */
      .success {
        border-left: 4px solid #10b981;
      }
      .success .icon {
        color: #10b981;
      }

      .error {
        border-left: 4px solid #ef4444;
      }
      .error .icon {
        color: #ef4444;
      }

      .warning {
        border-left: 4px solid #f59e0b;
      }
      .warning .icon {
        color: #f59e0b;
      }

      .info {
        border-left: 4px solid #3b82f6;
      }
      .info .icon {
        color: #3b82f6;
      }
    `,
  ],
})
export class MessageComponent implements OnInit {
  @Input() type: MessageType = 'info';
  @Input() content = '';
  show = false;

  ngOnInit() {
    // Trigger animation after a small delay
    setTimeout(() => (this.show = true), 10);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private appRef = inject(ApplicationRef);
  private environmentInjector = inject(EnvironmentInjector);

  private show(type: MessageType, content: string, duration = 3000) {
    // Create component
    const componentRef: ComponentRef<MessageComponent> = createComponent(MessageComponent, {
      environmentInjector: this.environmentInjector,
    });

    // Set inputs
    componentRef.instance.type = type;
    componentRef.instance.content = content;

    // Attach to view
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Remove after duration
    setTimeout(() => {
      componentRef.instance.show = false;
      setTimeout(() => {
        this.appRef.detachView(componentRef.hostView);
        componentRef.destroy();
      }, 300); // Wait for animation
    }, duration);
  }

  success(content: string, duration?: number) {
    this.show('success', content, duration);
  }

  error(content: string, duration?: number) {
    this.show('error', content, duration);
  }

  warning(content: string, duration?: number) {
    this.show('warning', content, duration);
  }

  info(content: string, duration?: number) {
    this.show('info', content, duration);
  }
}
