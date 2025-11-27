import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Graph, Shape } from '@antv/x6';
import { History } from '@antv/x6-plugin-history';
import { Selection } from '@antv/x6-plugin-selection';
import { Snapline } from '@antv/x6-plugin-snapline';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import {
  FlowNode,
  FlowConnection,
  FlowNodeType,
  FlowchartData,
  PRESET_COLORS,
} from '../models';
import { DialogService } from '@repo/ui-lib';

// Node 属性接口
interface NodeProperties {
  id?: string;
  attrs?: {
    label?: { text?: string };
    body?: { fill?: string; stroke?: string };
  };
  data?: { flowType?: string };
}

// 注册自定义节点形状
Graph.registerNode(
  'flow-start',
  {
    inherit: 'ellipse',
    width: 120,
    height: 50,
    attrs: {
      body: {
        strokeWidth: 2,
        stroke: '#059669',
        fill: '#10b981',
      },
      label: {
        fontSize: 14,
        fill: '#fff',
        fontWeight: 500,
      },
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
      },
      items: [
        { group: 'top', id: 'top' },
        { group: 'bottom', id: 'bottom' },
        { group: 'left', id: 'left' },
        { group: 'right', id: 'right' },
      ],
    },
  },
  true,
);

Graph.registerNode(
  'flow-process',
  {
    inherit: 'rect',
    width: 140,
    height: 60,
    attrs: {
      body: {
        strokeWidth: 2,
        stroke: '#2563eb',
        fill: '#3b82f6',
        rx: 8,
        ry: 8,
      },
      label: {
        fontSize: 14,
        fill: '#fff',
        fontWeight: 500,
      },
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
      },
      items: [
        { group: 'top', id: 'top' },
        { group: 'bottom', id: 'bottom' },
        { group: 'left', id: 'left' },
        { group: 'right', id: 'right' },
      ],
    },
  },
  true,
);

Graph.registerNode(
  'flow-decision',
  {
    inherit: 'polygon',
    width: 140,
    height: 80,
    attrs: {
      body: {
        strokeWidth: 2,
        stroke: '#d97706',
        fill: '#f59e0b',
        refPoints: '0,0.5 0.5,0 1,0.5 0.5,1',
      },
      label: {
        fontSize: 14,
        fill: '#fff',
        fontWeight: 500,
      },
    },
    ports: {
      groups: {
        top: {
          position: { name: 'top' },
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        bottom: {
          position: { name: 'bottom' },
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        left: {
          position: { name: 'left' },
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        right: {
          position: { name: 'right' },
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
      },
      items: [
        { group: 'top', id: 'top' },
        { group: 'bottom', id: 'bottom' },
        { group: 'left', id: 'left' },
        { group: 'right', id: 'right' },
      ],
    },
  },
  true,
);

Graph.registerNode(
  'flow-end',
  {
    inherit: 'ellipse',
    width: 120,
    height: 50,
    attrs: {
      body: {
        strokeWidth: 2,
        stroke: '#dc2626',
        fill: '#ef4444',
      },
      label: {
        fontSize: 14,
        fill: '#fff',
        fontWeight: 500,
      },
    },
    ports: {
      groups: {
        top: {
          position: 'top',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        bottom: {
          position: 'bottom',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        left: {
          position: 'left',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
        right: {
          position: 'right',
          attrs: {
            circle: {
              r: 5,
              magnet: true,
              stroke: '#5F95FF',
              strokeWidth: 1,
              fill: '#fff',
            },
          },
        },
      },
      items: [
        { group: 'top', id: 'top' },
        { group: 'bottom', id: 'bottom' },
        { group: 'left', id: 'left' },
        { group: 'right', id: 'right' },
      ],
    },
  },
  true,
);

@Component({
  selector: 'app-flowchart-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flowchart-builder" [class.readonly-mode]="readonly">
      <!-- 工具栏 -->
      @if (!readonly) {
      <div class="toolbar">
        <div class="toolbar-section">
          <span class="toolbar-label">节点工具</span>
          <button class="tool-btn" (click)="addNode('start')" title="开始节点">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="12" rx="10" ry="6" />
            </svg>
            开始
          </button>
          <button class="tool-btn" (click)="addNode('process')" title="流程节点">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="6" width="18" height="12" rx="2" />
            </svg>
            流程
          </button>
          <button class="tool-btn" (click)="addNode('decision')" title="判断节点">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2 L22 12 L12 22 L2 12 Z" />
            </svg>
            判断
          </button>
          <button class="tool-btn" (click)="addNode('end')" title="结束节点">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <ellipse cx="12" cy="12" rx="10" ry="6" />
              <ellipse cx="12" cy="12" rx="7" ry="4" />
            </svg>
            结束
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-section">
          <span class="toolbar-label">编辑</span>
          <button class="tool-btn" [disabled]="!canUndo()" (click)="undo()" title="撤销 (Ctrl+Z)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v6h6" />
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
          </button>
          <button class="tool-btn" [disabled]="!canRedo()" (click)="redo()" title="重做 (Ctrl+Y)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 7v6h-6" />
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
            </svg>
          </button>
          <button class="tool-btn" (click)="deleteSelected()" title="删除选中 (Delete)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-section">
          <span class="toolbar-label">视图</span>
          <button class="tool-btn" (click)="zoomIn()" title="放大">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button class="tool-btn" (click)="zoomOut()" title="缩小">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button class="tool-btn" (click)="resetView()" title="重置视图">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18" />
              <path d="M18 17V9H10" />
            </svg>
          </button>
          <span class="zoom-label">{{ zoomPercent() }}%</span>
        </div>

        <div class="toolbar-divider"></div>

        <div class="toolbar-section">
          <span class="toolbar-label">模式</span>
          <button class="tool-btn" [class.active]="viewMode() === 'visual'" (click)="setViewMode('visual')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            可视化
          </button>
          <button class="tool-btn" [class.active]="viewMode() === 'code'" (click)="setViewMode('code')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            代码
          </button>
        </div>

        <div class="toolbar-spacer"></div>

        <div class="toolbar-section">
          <button class="tool-btn primary" (click)="exportData()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            导出
          </button>
        </div>
      </div>
      }

      <!-- 主要内容区 -->
      <div class="main-content">
        <!-- 可视化模式 -->
        <div class="canvas-container" [class.hidden]="viewMode() === 'code'" #canvasContainer></div>

        <!-- 代码模式 -->
        @if (viewMode() === 'code') {
          <div class="code-editor-container">
            <div class="code-header">
              <div class="code-tabs">
                <button class="code-tab active">JSON 数据</button>
              </div>
              <div class="code-actions">
                <button class="action-btn" (click)="showImportDialog()" title="导入代码">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  导入
                </button>
                <button class="action-btn" (click)="showAiHelpDialog()" title="AI 生成帮助">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  AI 帮助
                </button>
              </div>
            </div>
            <div class="code-editor">
              <div class="line-numbers">
                @for (line of codeLineNumbers(); track line) {
                  <span>{{ line }}</span>
                }
              </div>
              <textarea
                class="code-textarea"
                [value]="codeContent()"
                (input)="onCodeChange($any($event.target).value)"
                spellcheck="false"
                placeholder="在此粘贴或输入 JSON 代码..."
              ></textarea>
            </div>
            @if (codeError()) {
              <div class="code-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {{ codeError() }}
              </div>
            }
          </div>
        }

        <!-- 导入对话框 -->
        @if (showImport()) {
          <div class="modal-overlay" (click)="closeModals()" (keydown.escape)="closeModals()" tabindex="0" role="dialog">
            <div class="modal-content" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" role="document">
              <div class="modal-header">
                <h3>导入流程图代码</h3>
                <button class="close-btn" (click)="closeModals()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div class="modal-body">
                <p class="modal-desc">粘贴 JSON 格式的流程图数据：</p>
                <textarea
                  class="import-textarea"
                  [(ngModel)]="importCode"
                  placeholder="粘贴 JSON 代码..."
                  rows="12"
                ></textarea>
                @if (importError()) {
                  <div class="import-error">{{ importError() }}</div>
                }
              </div>
              <div class="modal-footer">
                <button class="btn-secondary" (click)="closeModals()">取消</button>
                <button class="btn-primary" (click)="doImport()">导入</button>
              </div>
            </div>
          </div>
        }

        <!-- AI 帮助对话框 -->
        @if (showAiHelp()) {
          <div class="modal-overlay" (click)="closeModals()" (keydown.escape)="closeModals()" tabindex="0" role="dialog">
            <div class="modal-content modal-lg" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" role="document">
              <div class="modal-header">
                <h3>AI 生成流程图帮助</h3>
                <button class="close-btn" (click)="closeModals()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div class="modal-body">
                <p class="modal-desc">复制以下提示词给 AI，让它帮你生成流程图代码：</p>
                <div class="prompt-box">
                  <pre class="prompt-content">{{ aiPrompt }}</pre>
                  <button class="copy-btn" (click)="copyPrompt()" [class.copied]="promptCopied()">
                    @if (promptCopied()) {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      已复制
                    } @else {
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      复制
                    }
                  </button>
                </div>
                <div class="example-section">
                  <h4>示例输出：</h4>
                  <pre class="example-code">{{ exampleCode }}</pre>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-primary" (click)="closeModals()">我知道了</button>
              </div>
            </div>
          </div>
        }

        <!-- 属性面板 -->
        @if (selectedNode() && viewMode() === 'visual') {
          <div class="properties-panel">
            <div class="panel-header">
              <span>节点属性</span>
              <button class="close-btn" (click)="clearSelection()" aria-label="关闭属性面板">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="panel-body">
              <div class="property-group">
                <span class="property-label">类型</span>
                <span class="node-type-badge" [attr.data-type]="selectedNode()?.data?.flowType">
                  {{ getNodeTypeLabel(selectedNode()?.data?.flowType) }}
                </span>
              </div>
              <div class="property-group">
                <label for="node-text-input">文本</label>
                <input
                  id="node-text-input"
                  type="text"
                  [value]="selectedNode()?.attrs?.label?.text || ''"
                  (input)="updateNodeText($any($event.target).value)"
                />
              </div>
              <div class="property-group">
                <span class="property-label">填充颜色</span>
                <div class="color-picker">
                  @for (color of presetColors; track color) {
                    <button
                      class="color-swatch"
                      [style.background]="color"
                      [class.active]="selectedNode()?.attrs?.body?.fill === color"
                      (click)="updateNodeColor('fill', color)"
                      [attr.aria-label]="'选择填充颜色 ' + color"
                    ></button>
                  }
                  <input
                    type="color"
                    [value]="selectedNode()?.attrs?.body?.fill || '#3b82f6'"
                    (input)="updateNodeColor('fill', $any($event.target).value)"
                    class="color-input"
                  />
                </div>
              </div>
              <div class="property-group">
                <span class="property-label">边框颜色</span>
                <div class="color-picker">
                  @for (color of presetColors; track color) {
                    <button
                      class="color-swatch"
                      [style.background]="color"
                      [class.active]="selectedNode()?.attrs?.body?.stroke === color"
                      (click)="updateNodeColor('stroke', color)"
                      [attr.aria-label]="'选择边框颜色 ' + color"
                    ></button>
                  }
                  <input
                    type="color"
                    [value]="selectedNode()?.attrs?.body?.stroke || '#2563eb'"
                    (input)="updateNodeColor('stroke', $any($event.target).value)"
                    class="color-input"
                  />
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      background: var(--color-background);
    }

    .flowchart-builder {
      display: flex;
      flex-direction: column;
      height: 100%;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      flex-wrap: wrap;
    }

    .toolbar-section {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .toolbar-label {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-right: 0.5rem;
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      background: var(--color-border);
      margin: 0 0.5rem;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .tool-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      color: var(--color-text);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .tool-btn:hover:not(:disabled) {
      background: var(--color-surface-hover);
      border-color: var(--color-border);
    }

    .tool-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .tool-btn.active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .tool-btn.primary {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
    }

    .tool-btn.primary:hover {
      opacity: 0.9;
    }

    .zoom-label {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      min-width: 40px;
      text-align: center;
    }

    .main-content {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .canvas-container {
      width: 100%;
      height: 100%;
    }

    .canvas-container.hidden {
      display: none;
    }

    .code-editor-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #0f172a;
    }

    .code-editor {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .line-numbers {
      display: flex;
      flex-direction: column;
      padding: 1rem 0.5rem;
      background: #1e293b;
      color: #475569;
      font-family: monospace;
      font-size: 0.85rem;
      line-height: 1.5;
      text-align: right;
      user-select: none;
      min-width: 40px;
    }

    .code-textarea {
      flex: 1;
      padding: 1rem;
      background: transparent;
      border: none;
      color: #e2e8f0;
      font-family: monospace;
      font-size: 0.85rem;
      line-height: 1.5;
      resize: none;
      outline: none;
      white-space: pre;
      overflow: auto;
    }

    .code-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border-top: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      font-size: 0.85rem;
    }

    .properties-panel {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 280px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: var(--color-surface-hover);
      border-bottom: 1px solid var(--color-border);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .close-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: transparent;
      border: none;
      border-radius: 4px;
      color: var(--color-text-secondary);
      cursor: pointer;
    }

    .close-btn:hover {
      background: var(--color-border);
    }

    .panel-body {
      padding: 1rem;
    }

    .property-group {
      margin-bottom: 1rem;
    }

    .property-group:last-child {
      margin-bottom: 0;
    }

    .property-group label,
    .property-label {
      display: block;
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      margin-bottom: 0.5rem;
    }

    .property-group input[type="text"] {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 0.85rem;
      background: var(--color-background);
      color: var(--color-text);
      outline: none;
    }

    .property-group input:focus {
      border-color: var(--color-primary);
    }

    .node-type-badge {
      display: inline-flex;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 500;
      color: white;
    }

    .node-type-badge[data-type="start"] { background: #10b981; }
    .node-type-badge[data-type="process"] { background: #3b82f6; }
    .node-type-badge[data-type="decision"] { background: #f59e0b; }
    .node-type-badge[data-type="end"] { background: #ef4444; }

    .color-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .color-swatch {
      width: 24px;
      height: 24px;
      border: 2px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .color-swatch:hover {
      transform: scale(1.1);
    }

    .color-swatch.active {
      border-color: var(--color-text);
    }

    .color-input {
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    /* 代码编辑器头部 */
    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }

    .code-tabs {
      display: flex;
      gap: 0.5rem;
    }

    .code-tab {
      padding: 0.5rem 1rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.85rem;
      cursor: pointer;
      border-radius: 4px;
    }

    .code-tab.active {
      background: #334155;
      color: #e2e8f0;
    }

    .code-actions {
      display: flex;
      gap: 0.5rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.75rem;
      background: #334155;
      border: none;
      border-radius: 4px;
      color: #e2e8f0;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      background: #475569;
    }

    /* 模态框样式 */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      background: var(--color-surface);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .modal-content.modal-lg {
      max-width: 700px;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      background: var(--color-surface-hover);
      border-bottom: 1px solid var(--color-border);
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .modal-body {
      padding: 1.25rem;
      overflow-y: auto;
      flex: 1;
    }

    .modal-desc {
      margin: 0 0 1rem;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--color-surface-hover);
      border-top: 1px solid var(--color-border);
    }

    .import-textarea {
      width: 100%;
      padding: 0.75rem;
      background: #0f172a;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      color: #e2e8f0;
      font-family: monospace;
      font-size: 0.85rem;
      resize: vertical;
      outline: none;
    }

    .import-textarea:focus {
      border-color: var(--color-primary);
    }

    .import-error {
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      color: #ef4444;
      font-size: 0.85rem;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.5rem 1.25rem;
      border: none;
      border-radius: 6px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .btn-secondary {
      background: var(--color-border);
      color: var(--color-text);
    }

    .btn-secondary:hover {
      background: var(--color-surface-hover);
    }

    .prompt-box {
      position: relative;
      background: #0f172a;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      overflow: hidden;
    }

    .prompt-content {
      margin: 0;
      padding: 1rem;
      padding-right: 80px;
      color: #e2e8f0;
      font-size: 0.85rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 200px;
      overflow-y: auto;
    }

    .copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.4rem 0.75rem;
      background: #334155;
      border: none;
      border-radius: 4px;
      color: #e2e8f0;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .copy-btn:hover {
      background: #475569;
    }

    .copy-btn.copied {
      background: #10b981;
    }

    .example-section {
      margin-top: 1.25rem;
    }

    .example-section h4 {
      margin: 0 0 0.75rem;
      font-size: 0.9rem;
      color: var(--color-text);
    }

    .example-code {
      margin: 0;
      padding: 1rem;
      background: #0f172a;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: #94a3b8;
      font-size: 0.8rem;
      line-height: 1.5;
      overflow-x: auto;
      white-space: pre;
    }
  `],
})
export class FlowchartBuilderComponent implements AfterViewInit, OnDestroy {
  private dialogService = inject(DialogService);
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  @Input() set data(value: FlowchartData | null) {
    if (value && this.graph) {
      this.loadData(value);
    } else if (value) {
      this.pendingData = value;
    }
  }

  @Input() readonly = false; // 只读模式

  @Output() dataChange = new EventEmitter<FlowchartData>();

  readonly presetColors = PRESET_COLORS;

  private graph!: Graph;
  private pendingData: FlowchartData | null = null;

  // 响应式状态
  viewMode = signal<'visual' | 'code'>('visual');
  zoomPercent = signal(100);
  canUndo = signal(false);
  canRedo = signal(false);
  selectedNode = signal<NodeProperties | null>(null);
  codeContent = signal('');
  codeError = signal<string | null>(null);
  
  // 导入和 AI 帮助相关状态
  showImport = signal(false);
  showAiHelp = signal(false);
  importCode = '';
  importError = signal<string | null>(null);
  promptCopied = signal(false);

  // AI 提示词
  readonly aiPrompt = `请帮我生成一个流程图的 JSON 数据，格式要求如下：

{
  "nodes": [
    {
      "id": "唯一ID",
      "type": "start|process|decision|end",
      "text": "节点显示文字",
      "x": 数字(水平位置),
      "y": 数字(垂直位置),
      "width": 数字(宽度，默认120-140),
      "height": 数字(高度，默认50-80)
    }
  ],
  "connections": [
    {
      "id": "唯一ID",
      "from": { "nodeId": "源节点ID", "position": "top|right|bottom|left" },
      "to": { "nodeId": "目标节点ID", "position": "top|right|bottom|left" },
      "text": "可选的连接标签"
    }
  ]
}

节点类型说明：
- start: 开始节点（椭圆形，绿色）
- process: 流程节点（圆角矩形，蓝色）
- decision: 判断节点（菱形，橙色）
- end: 结束节点（椭圆形，红色）

布局建议：
- x 坐标范围: 200-600
- y 坐标从 100 开始，每层间隔 120
- 节点从上到下排列

请根据我的需求生成流程图数据：`;

  // 示例代码
  readonly exampleCode = `{
  "nodes": [
    { "id": "1", "type": "start", "text": "开始", "x": 400, "y": 100, "width": 120, "height": 50 },
    { "id": "2", "type": "process", "text": "处理步骤", "x": 400, "y": 220, "width": 140, "height": 60 },
    { "id": "3", "type": "decision", "text": "是否通过?", "x": 400, "y": 340, "width": 140, "height": 80 },
    { "id": "4", "type": "end", "text": "结束", "x": 400, "y": 460, "width": 120, "height": 50 }
  ],
  "connections": [
    { "id": "c1", "from": { "nodeId": "1", "position": "bottom" }, "to": { "nodeId": "2", "position": "top" } },
    { "id": "c2", "from": { "nodeId": "2", "position": "bottom" }, "to": { "nodeId": "3", "position": "top" } },
    { "id": "c3", "from": { "nodeId": "3", "position": "bottom" }, "to": { "nodeId": "4", "position": "top" }, "text": "是" }
  ]
}`;

  codeLineNumbers = computed(() => {
    const lines = this.codeContent().split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });

  // 对话框方法
  showImportDialog() {
    this.importCode = '';
    this.importError.set(null);
    this.showImport.set(true);
  }

  showAiHelpDialog() {
    this.showAiHelp.set(true);
  }

  closeModals() {
    this.showImport.set(false);
    this.showAiHelp.set(false);
  }

  doImport() {
    try {
      const data = JSON.parse(this.importCode) as FlowchartData;
      if (!Array.isArray(data.nodes) || !Array.isArray(data.connections)) {
        throw new Error('数据格式错误：需要包含 nodes 和 connections 数组');
      }
      this.loadData(data);
      this.closeModals();
      this.viewMode.set('visual');
    } catch (e) {
      this.importError.set('JSON 解析错误: ' + (e as Error).message);
    }
  }

  copyPrompt() {
    navigator.clipboard.writeText(this.aiPrompt).then(() => {
      this.promptCopied.set(true);
      setTimeout(() => this.promptCopied.set(false), 2000);
    });
  }

  ngAfterViewInit() {
    this.initGraph();
    if (this.pendingData) {
      this.loadData(this.pendingData);
      this.pendingData = null;
    }
  }

  ngOnDestroy() {
    this.graph?.dispose();
  }

  private initGraph() {
    this.graph = new Graph({
      container: this.canvasContainer.nativeElement,
      background: {
        color: '#f8fafc',
      },
      grid: false,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: null,
        minScale: 0.2,
        maxScale: 3,
      },
      panning: {
        enabled: true,
        eventTypes: ['leftMouseDown', 'mouseWheel'],
      },
      connecting: {
        router: 'manhattan',
        connector: {
          name: 'rounded',
          args: { radius: 8 },
        },
        anchor: 'center',
        connectionPoint: 'anchor',
        allowBlank: false,
        snap: { radius: 20 },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#5F95FF',
                strokeWidth: 2,
                targetMarker: {
                  name: 'block',
                  width: 12,
                  height: 8,
                },
              },
            },
            labels: [],
            zIndex: 0,
          });
        },
        validateConnection({ sourceCell, targetCell }) {
          return sourceCell !== targetCell;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: 'stroke',
          args: { attrs: { fill: '#5F95FF', stroke: '#5F95FF' } },
        },
      },
    });

    // 注册插件
    this.graph.use(new History({ enabled: true }));
    this.graph.use(new Selection({
      enabled: true,
      multiple: true,
      rubberband: true,
      movable: true,
      showNodeSelectionBox: true,
    }));
    this.graph.use(new Snapline({ enabled: true }));
    this.graph.use(new Keyboard({ enabled: true }));
    this.graph.use(new Clipboard({ enabled: true }));

    // 绑定快捷键
    this.graph.bindKey(['meta+z', 'ctrl+z'], () => this.undo());
    this.graph.bindKey(['meta+shift+z', 'ctrl+y'], () => this.redo());
    this.graph.bindKey(['backspace', 'delete'], () => this.deleteSelected());
    this.graph.bindKey(['meta+c', 'ctrl+c'], () => this.graph.copy(this.graph.getSelectedCells()));
    this.graph.bindKey(['meta+v', 'ctrl+v'], () => this.graph.paste({ offset: 32 }));

    // 监听事件
    this.graph.on('history:change', () => {
      this.canUndo.set(this.graph.canUndo());
      this.canRedo.set(this.graph.canRedo());
      this.emitDataChange();
    });

    this.graph.on('scale', ({ sx }) => {
      this.zoomPercent.set(Math.round(sx * 100));
    });

    this.graph.on('selection:changed', ({ selected }) => {
      if (selected.length === 1 && selected[0].isNode()) {
        this.selectedNode.set(selected[0].toJSON() as NodeProperties);
      } else {
        this.selectedNode.set(null);
      }
    });

    // 双击编辑节点文本 - 使用内联编辑器
    this.graph.on('node:dblclick', ({ node }) => {
      this.showInlineEditor(node);
    });

    // 双击编辑边标签
    this.graph.on('edge:dblclick', ({ edge }) => {
      const labels = edge.getLabels();
      const labelAttrs = labels[0]?.attrs as Record<string, Record<string, unknown>> | undefined;
      const currentText = String(labelAttrs?.['label']?.['text'] || '');
      this.dialogService.prompt({
        title: '编辑连接标签',
        placeholder: '输入标签文本',
        defaultValue: currentText,
      }).then((newText) => {
        if (newText !== null) {
          if (newText) {
            edge.setLabels([{
              attrs: { label: { text: newText } },
              position: { distance: 0.5 },
            }]);
          } else {
            edge.setLabels([]);
          }
        }
      });
    });
  }

  // 显示内联编辑器
  private showInlineEditor(node: ReturnType<Graph['getCellById']>) {
    if (!node || !node.isNode()) return;
    
    const text = String(node.attr('label/text') || '');
    const bbox = node.getBBox();
    const pos = this.graph.localToGraph(bbox.center);
    
    // 创建编辑器
    const editor = document.createElement('input');
    editor.type = 'text';
    editor.value = text;
    editor.className = 'inline-node-editor';
    editor.style.cssText = `
      position: absolute;
      left: ${pos.x}px;
      top: ${pos.y}px;
      transform: translate(-50%, -50%);
      min-width: 100px;
      padding: 4px 8px;
      border: 2px solid #3b82f6;
      border-radius: 4px;
      font-size: 14px;
      text-align: center;
      outline: none;
      z-index: 1000;
      background: white;
    `;
    
    const container = this.canvasContainer.nativeElement;
    container.appendChild(editor);
    editor.focus();
    editor.select();
    
    const finishEdit = () => {
      const newText = editor.value.trim();
      if (newText) {
        node.attr('label/text', newText);
      }
      editor.remove();
    };
    
    editor.addEventListener('blur', finishEdit);
    editor.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') {
        finishEdit();
      } else if (evt.key === 'Escape') {
        editor.remove();
      }
    });
  }

  addNode(type: FlowNodeType) {
    const shapeMap: Record<FlowNodeType, string> = {
      start: 'flow-start',
      process: 'flow-process',
      decision: 'flow-decision',
      end: 'flow-end',
    };

    const textMap: Record<FlowNodeType, string> = {
      start: '开始',
      process: '流程步骤',
      decision: '条件判断?',
      end: '结束',
    };

    const center = this.graph.getGraphArea().center;

    this.graph.addNode({
      shape: shapeMap[type],
      x: center.x - 60 + Math.random() * 100,
      y: center.y - 30 + Math.random() * 100,
      label: textMap[type],
      data: { flowType: type },
    });
  }

  deleteSelected() {
    const cells = this.graph.getSelectedCells();
    if (cells.length) {
      this.graph.removeCells(cells);
    }
  }

  undo() {
    if (this.graph.canUndo()) {
      this.graph.undo();
    }
  }

  redo() {
    if (this.graph.canRedo()) {
      this.graph.redo();
    }
  }

  zoomIn() {
    this.graph.zoom(0.1);
  }

  zoomOut() {
    this.graph.zoom(-0.1);
  }

  resetView() {
    this.graph.zoomTo(1);
    this.graph.centerContent();
  }

  setViewMode(mode: 'visual' | 'code') {
    if (mode === 'code') {
      this.updateCodeContent();
    }
    this.viewMode.set(mode);
  }

  clearSelection() {
    this.graph.cleanSelection();
    this.selectedNode.set(null);
  }

  updateNodeText(text: string) {
    const cells = this.graph.getSelectedCells();
    if (cells.length === 1 && cells[0].isNode()) {
      cells[0].attr('label/text', text);
      this.selectedNode.set(cells[0].toJSON() as NodeProperties);
    }
  }

  updateNodeColor(type: 'fill' | 'stroke', color: string) {
    const cells = this.graph.getSelectedCells();
    if (cells.length === 1 && cells[0].isNode()) {
      cells[0].attr(`body/${type}`, color);
      this.selectedNode.set(cells[0].toJSON() as NodeProperties);
    }
  }

  getNodeTypeLabel(type?: string): string {
    const labels: Record<string, string> = {
      start: '开始',
      process: '流程',
      decision: '判断',
      end: '结束',
    };
    return labels[type || ''] || '未知';
  }

  private updateCodeContent() {
    const data = this.getFlowchartData();
    this.codeContent.set(JSON.stringify(data, null, 2));
  }

  onCodeChange(value: string) {
    try {
      const data = JSON.parse(value) as FlowchartData;
      if (Array.isArray(data.nodes) && Array.isArray(data.connections)) {
        this.loadData(data);
        this.codeError.set(null);
      } else {
        throw new Error('Invalid data structure');
      }
    } catch (e) {
      this.codeError.set('JSON 格式错误: ' + (e as Error).message);
    }
  }

  exportData() {
    const data = this.getFlowchartData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  private getFlowchartData(): FlowchartData {
    const nodes: FlowNode[] = [];
    const connections: FlowConnection[] = [];

    this.graph.getNodes().forEach((node) => {
      const pos = node.getPosition();
      const size = node.getSize();
      const data = node.getData() || {};
      nodes.push({
        id: node.id,
        type: data.flowType || 'process',
        text: node.attr('label/text') as string || '',
        x: pos.x + size.width / 2,
        y: pos.y + size.height / 2,
        width: size.width,
        height: size.height,
        fillColor: node.attr('body/fill') as string || '#3b82f6',
        strokeColor: node.attr('body/stroke') as string || '#2563eb',
      });
    });

    this.graph.getEdges().forEach((edge) => {
      const sourcePort = edge.getSourcePortId() || 'bottom';
      const targetPort = edge.getTargetPortId() || 'top';
      const labels = edge.getLabels();

      const labelAttrs = labels[0]?.attrs as Record<string, Record<string, unknown>> | undefined;
      connections.push({
        id: edge.id,
        from: {
          nodeId: edge.getSourceCellId() || '',
          position: sourcePort as 'top' | 'right' | 'bottom' | 'left',
        },
        to: {
          nodeId: edge.getTargetCellId() || '',
          position: targetPort as 'top' | 'right' | 'bottom' | 'left',
        },
        text: labelAttrs?.['label']?.['text'] as string | undefined,
      });
    });

    return { nodes, connections };
  }

  private loadData(data: FlowchartData) {
    this.graph.clearCells();

    const shapeMap: Record<FlowNodeType, string> = {
      start: 'flow-start',
      process: 'flow-process',
      decision: 'flow-decision',
      end: 'flow-end',
    };

    // 添加节点
    data.nodes.forEach((node) => {
      this.graph.addNode({
        id: node.id,
        shape: shapeMap[node.type],
        x: node.x - node.width / 2,
        y: node.y - node.height / 2,
        width: node.width,
        height: node.height,
        label: node.text,
        data: { flowType: node.type },
        attrs: {
          body: {
            fill: node.fillColor,
            stroke: node.strokeColor,
          },
        },
      });
    });

    // 添加连接
    data.connections.forEach((conn) => {
      this.graph.addEdge({
        id: conn.id,
        source: { cell: conn.from.nodeId, port: conn.from.position },
        target: { cell: conn.to.nodeId, port: conn.to.position },
        labels: conn.text ? [{ attrs: { label: { text: conn.text } }, position: { distance: 0.5 } }] : [],
        attrs: {
          line: {
            stroke: '#5F95FF',
            strokeWidth: 2,
            targetMarker: { name: 'block', width: 12, height: 8 },
          },
        },
      });
    });

    this.graph.centerContent();
  }

  private emitDataChange() {
    this.dataChange.emit(this.getFlowchartData());
  }
}
