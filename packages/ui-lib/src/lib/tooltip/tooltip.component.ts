import { Component, Input, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tooltip-wrapper">
      <ng-content></ng-content>
      @if (visible && text) {
        <div class="tooltip-content" [class]="position">
          {{ text }}
          <div class="tooltip-arrow"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    .tooltip-wrapper {
      position: relative;
      display: inline-flex;
    }
    
    .tooltip-content {
      position: absolute;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10000;
      pointer-events: none;
      animation: fadeIn 0.1s ease-out;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .tooltip-arrow {
      position: absolute;
      width: 0;
      height: 0;
      border: 5px solid transparent;
    }
    
    .tooltip-content.top {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 6px;
    }
    
    .tooltip-content.top .tooltip-arrow {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: rgba(0, 0, 0, 0.85);
    }
    
    .tooltip-content.bottom {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 6px;
    }
    
    .tooltip-content.bottom .tooltip-arrow {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: rgba(0, 0, 0, 0.85);
    }
    
    .tooltip-content.left {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 6px;
    }
    
    .tooltip-content.left .tooltip-arrow {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: rgba(0, 0, 0, 0.85);
    }
    
    .tooltip-content.right {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 6px;
    }
    
    .tooltip-content.right .tooltip-arrow {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: rgba(0, 0, 0, 0.85);
    }
  `]
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  
  visible = false;
  private el = inject(ElementRef);
  
  @HostListener('mouseenter')
  onMouseEnter() {
    this.visible = true;
  }
  
  @HostListener('mouseleave')
  onMouseLeave() {
    this.visible = false;
  }
}
