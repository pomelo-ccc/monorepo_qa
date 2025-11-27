import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FlowchartBuilderComponent } from './flowchart-builder.component';
import { FlowchartData } from '../models';
import { ButtonComponent } from '@repo/ui-lib';

@Component({
  selector: 'app-flowchart-builder-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FlowchartBuilderComponent,
    ButtonComponent,
  ],
  template: `
    <div class="page-container">
      <header class="page-header">
        <div class="header-left">
          <button class="back-btn" (click)="goBack()" aria-label="返回">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1>流程图构建器</h1>
        </div>
        <div class="header-right">
          <lib-button variant="ghost" (click)="goBack()">取消</lib-button>
          <lib-button variant="primary" (click)="saveAndReturn()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            保存并返回
          </lib-button>
        </div>
      </header>
      <main class="page-main">
        <app-flowchart-builder
          [data]="flowchartData()"
          (dataChange)="onDataChange($event)"
        />
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      background: var(--color-background);
    }

    .page-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .back-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .back-btn:hover {
      background: var(--color-surface-hover);
    }

    h1 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-main {
      flex: 1;
      padding: 1rem;
      overflow: hidden;
    }
  `],
})
export class FlowchartBuilderPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  flowchartData = signal<FlowchartData | null>(null);
  private currentData: FlowchartData | null = null;
  private returnUrl = '/';
  private stateKey = '';

  ngOnInit() {
    // 从路由参数获取返回 URL
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.stateKey = this.route.snapshot.queryParamMap.get('stateKey') || 'flowchart-builder-data';

    // 从 sessionStorage 获取数据
    const savedData = sessionStorage.getItem(this.stateKey);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        this.flowchartData.set(data);
        this.currentData = data; // 确保 currentData 也初始化
      } catch {
        this.flowchartData.set({ nodes: [], connections: [] });
        this.currentData = { nodes: [], connections: [] };
      }
    } else {
      this.flowchartData.set({ nodes: [], connections: [] });
      this.currentData = { nodes: [], connections: [] };
    }
  }

  onDataChange(data: FlowchartData) {
    this.currentData = data;
  }

  goBack() {
    // 不保存，直接返回
    sessionStorage.removeItem(this.stateKey);
    sessionStorage.removeItem('faq-edit-form');
    this.router.navigateByUrl(this.returnUrl);
  }

  saveAndReturn() {
    // 保存流程图数据
    if (this.currentData) {
      sessionStorage.setItem(this.stateKey, JSON.stringify(this.currentData));
    }
    this.router.navigateByUrl(this.returnUrl);
  }
}
