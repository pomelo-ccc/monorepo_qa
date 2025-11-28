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
      background: #333;
      color: #fff;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10000;
      pointer-events: none;
      animation: fadeIn 0.15s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
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
      margin-bottom: 8px;
    }
    
    .tooltip-content.top .tooltip-arrow {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-top-color: #333;
    }
    
    .tooltip-content.bottom {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 8px;
    }
    
    .tooltip-content.bottom .tooltip-arrow {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-bottom-color: #333;
    }
    
    .tooltip-content.left {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 8px;
    }
    
    .tooltip-content.left .tooltip-arrow {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-left-color: #333;
    }
    
    .tooltip-content.right {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 8px;
    }
    
    .tooltip-content.right .tooltip-arrow {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      border-right-color: #333;
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
