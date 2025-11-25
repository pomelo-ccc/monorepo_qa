import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import mermaid from 'mermaid';

@Component({
  selector: 'lib-mermaid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mermaid-container">
      @if (code) {
        <div #mermaidDiv class="mermaid">{{ code }}</div>
      } @else {
        <div class="empty-state">暂无流程图</div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .mermaid-container {
        background: var(--color-surface, #fff);
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }
      .empty-state {
        color: var(--color-textSecondary);
        font-size: 0.875rem;
      }
    `,
  ],
})
export class MermaidComponent implements AfterViewInit, OnChanges {
  @Input() code = '';
  @ViewChild('mermaidDiv') mermaidDiv?: ElementRef;

  constructor() {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }

  ngAfterViewInit() {
    this.renderMermaid();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['code'] && !changes['code'].firstChange) {
      // Delay slightly to ensure DOM is ready if using @if
      setTimeout(() => this.renderMermaid(), 0);
    }
  }

  renderMermaid() {
    if (this.mermaidDiv && this.code) {
      const element = this.mermaidDiv.nativeElement;
      element.innerHTML = this.code;
      element.removeAttribute('data-processed');

      mermaid
        .run({
          nodes: [element],
        })
        .catch((err: unknown) => console.error('Mermaid rendering failed:', err));
    }
  }
}
