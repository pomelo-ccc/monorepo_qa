import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tooltip-wrapper">
      <ng-content></ng-content>
      <div class="tooltip-content" [class]="position" [class.visible]="visible && text">
        {{ text }}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }
    
    .tooltip-wrapper {
      position: relative;
      display: inline-flex;
    }
    
    .tooltip-content {
      position: absolute;
      background: #1f1f1f;
      color: #fff;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      white-space: nowrap;
      z-index: 10000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.08s ease-out;
      border: 1px solid #333;
    }
    
    .tooltip-content.visible {
      opacity: 1;
    }
    
    .tooltip-content.top {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 4px;
    }
    
    .tooltip-content.bottom {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 4px;
    }
    
    .tooltip-content.left {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: 4px;
    }
    
    .tooltip-content.right {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: 4px;
    }
  `]
})
export class TooltipComponent {
  @Input() text = '';
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  
  visible = false;
  
  @HostListener('mouseenter')
  onMouseEnter() {
    this.visible = true;
  }
  
  @HostListener('mouseleave')
  onMouseLeave() {
    this.visible = false;
  }
}
