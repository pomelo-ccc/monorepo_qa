import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FaqService, ConfigService } from '../services';
import { FaqItem, FlowchartData } from '../models';
import {
  ButtonComponent,
  CardComponent,
  SelectComponent,
  TagComponent,
  MessageService,
} from '@repo/ui-lib';
import { FlowchartBuilderComponent } from '../flowchart-builder/flowchart-builder.component';

@Component({
  selector: 'app-faq-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    SelectComponent,
    TagComponent,
    FlowchartBuilderComponent,
  ],
  template: `
    <div class="page-wrapper">
      <!-- 顶部 Header -->
      <header class="top-header">
        <div class="header-left">
          <div class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <input
            type="text"
            class="title-input"
            [(ngModel)]="formData.title"
            placeholder="输入 FAQ 标题，例如：[Form] 异步校验失败后仍可提交表单..."
          />
        </div>
        <div class="header-right">
          <lib-button variant="ghost" (click)="onCancel()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            取消
          </lib-button>
          @if (!showFlowchart) {
            <lib-button variant="ghost" (click)="toggleFlowchart()" title="显示流程图">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
              显示流程图
            </lib-button>
          }
          <lib-button variant="primary" (click)="onSave()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {{ isEdit ? '保存修改' : '创建 FAQ' }}
          </lib-button>
        </div>
      </header>

      <div class="main-layout">
        <!-- 左侧边栏：基础信息 -->
        <aside class="left-sidebar">
          <lib-card title="基础信息" [hasHeader]="true">
            <ng-container ngProjectAs="[header-icon]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </ng-container>

            <div class="form-group">
              <div class="form-label">所属模块 <span class="required">*</span></div>
              <lib-select
                [(ngModel)]="formData.component"
                [options]="moduleOptions"
                placeholder="选择模块"
              ></lib-select>
            </div>

            <div class="form-group">
              <div class="form-label">适用版本</div>
              <lib-select
                [(ngModel)]="formData.version"
                [options]="versionOptions"
                placeholder="选择版本"
              ></lib-select>
            </div>

            <div class="form-group">
              <div class="form-label">相关标签 <span class="required">*</span></div>

              @if (formData.tags.length > 0) {
                <div class="selected-tags-list">
                  @for (tag of formData.tags; track tag) {
                    <lib-tag [selected]="true" (tagClick)="toggleTag(tag)" class="removable-tag">
                      {{ tag }} <span class="remove-icon">×</span>
                    </lib-tag>
                  }
                </div>
              }

              <div class="tags-list">
                @for (tag of tagOptions; track tag.value) {
                  <lib-tag
                    [selectable]="true"
                    [selected]="isTagSelected(tag.value)"
                    (selectedChange)="toggleTag(tag.value)"
                  >
                    {{ tag.label }}
                  </lib-tag>
                }
              </div>
            </div>
          </lib-card>
        </aside>

        <!-- 中间内容区：网格布局 -->
        <main class="center-content">
          <div class="content-grid">
            <!-- 问题描述 -->
            <fieldset class="edit-card warning">
              <legend class="card-legend">
                <div class="legend-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>问题描述</span>
                  <span class="required-mark">*</span>
                </div>
              </legend>
              <textarea
                [(ngModel)]="formData.summary"
                placeholder="详细描述遇到的问题..."
                class="text-area"
              ></textarea>
            </fieldset>

            <!-- 复刻步骤 -->
            <fieldset class="edit-card warning">
              <legend class="card-legend">
                <div class="legend-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>复刻步骤</span>
                  <span class="required-mark">*</span>
                </div>
              </legend>
              <textarea
                #stepsTextarea
                [(ngModel)]="formData.phenomenon"
                (keydown)="onStepsKeydown($event)"
                placeholder="1. "
                class="text-area steps-textarea"
              ></textarea>
            </fieldset>

            <!-- 附件上传 -->
            <fieldset class="edit-card info">
              <legend class="card-legend">
                <div class="legend-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>附件（图片/视频）</span>
                </div>
              </legend>
              <div class="attachments-area">
                <div class="attachments-grid">
                  @for (attachment of attachments; track attachment.id; let i = $index) {
                    <div class="attachment-item">
                      <div class="attachment-preview" (click)="openPreview(attachment)" (keydown.enter)="openPreview(attachment)" tabindex="0" role="button">
                        @if (attachment.type === 'image') {
                          <img [src]="attachment.url" [alt]="attachment.name" />
                          <div class="preview-overlay">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                              <line x1="11" y1="8" x2="11" y2="14" />
                              <line x1="8" y1="11" x2="14" y2="11" />
                            </svg>
                          </div>
                        } @else if (attachment.type === 'video') {
                          <div class="video-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                          <div class="preview-overlay">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        } @else if (attachment.type === 'markdown') {
                          <div class="markdown-placeholder">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                            <span class="file-ext">.md</span>
                          </div>
                          <div class="preview-overlay">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="11" cy="11" r="8" />
                              <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                          </div>
                        }
                      </div>
                      <span class="attachment-name">{{ attachment.name }}</span>
                      <button class="remove-attachment" (click)="removeAttachment(i); $event.stopPropagation()" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  }
                  <label class="add-attachment">
                    <input
                      type="file"
                      accept="image/*,video/*,.md,.markdown,text/markdown"
                      multiple
                      (change)="onFileSelect($event)"
                      hidden
                    />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>添加附件</span>
                  </label>
                </div>
              </div>
            </fieldset>

            <!-- 解决方案 -->
            <fieldset class="edit-card success">
              <legend class="card-legend">
                <div class="legend-content">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>解决方案</span>
                  <span class="required-mark">*</span>
                </div>
              </legend>
              <textarea
                [(ngModel)]="formData.solution"
                placeholder="详细说明如何修复该问题..."
                class="text-area"
              ></textarea>
            </fieldset>

          </div>
        </main>

        <!-- 附件预览 Modal -->
        @if (previewAttachment) {
          <div class="preview-modal" [class.markdown-mode]="previewAttachment.type === 'markdown'" (click)="closePreview()" (keydown.escape)="closePreview()" tabindex="0" role="dialog">
            <div class="preview-modal-content" [class.wide]="previewAttachment.type === 'markdown'" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()" role="document">
              <button class="preview-close" (click)="closePreview()">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div class="preview-body">
                @if (previewAttachment.type === 'image') {
                  <img [src]="previewAttachment.url" [alt]="previewAttachment.name" class="preview-image" />
                } @else if (previewAttachment.type === 'video') {
                  <video [src]="previewAttachment.url" controls autoplay class="preview-video">
                    您的浏览器不支持视频播放
                  </video>
                } @else if (previewAttachment.type === 'markdown') {
                  <div class="markdown-preview">
                    <pre class="markdown-content">{{ previewAttachment.content || '内容加载中...' }}</pre>
                  </div>
                }
              </div>
              <div class="preview-footer">
                <span class="preview-name">{{ previewAttachment.name }}</span>
                @if (attachments.length > 1) {
                  <div class="preview-nav">
                    <button class="nav-btn" (click)="prevPreview()" [disabled]="currentPreviewIndex === 0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span class="preview-counter">{{ currentPreviewIndex + 1 }} / {{ attachments.length }}</span>
                    <button class="nav-btn" (click)="nextPreview()" [disabled]="currentPreviewIndex === attachments.length - 1">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- 右侧边栏：流程图构建器 -->
        @if (showFlowchart) {
          <aside class="right-sidebar" [class.fullscreen-mode]="isFullscreen">
            <div class="flowchart-header">
              <span class="flowchart-title">排查流程图</span>
              <div class="flowchart-actions">
                <button class="icon-btn" title="全屏" (click)="toggleFullscreen()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
                <button class="icon-btn" (click)="toggleFlowchart()" title="隐藏">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="flowchart-container">
              <app-flowchart-builder
                [data]="flowchartData"
                (dataChange)="onFlowchartChange($event)"
              />
            </div>
          </aside>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background: var(--color-background);
        min-height: 100vh;
        color: var(--color-text);
      }

      .page-wrapper {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }

      /* Header */
      .top-header {
        height: 64px;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.5rem;
        flex-shrink: 0;
        backdrop-filter: blur(10px);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex: 1;
      }

      .icon-box {
        width: 32px;
        height: 32px;
        background: var(--color-primary);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .title-input {
        border: none;
        font-size: 1.1rem;
        width: 100%;
        max-width: 600px;
        outline: none;
        color: var(--color-text);
        background: transparent;
      }

      .title-input::placeholder {
        color: var(--color-text-secondary);
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      /* Main Layout */
      .main-layout {
        display: flex;
        flex: 1;
        overflow: hidden;
        padding: 1.5rem;
        gap: 1.5rem;
      }

      /* Left Sidebar */
      .left-sidebar {
        width: 280px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .form-group {
        margin-bottom: 1.2rem;
      }

      .form-group .form-label {
        display: block;
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.4rem;
        font-weight: 600;
      }

      .required {
        color: var(--color-error);
      }

      .selected-tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.8rem;
        padding: 0.5rem;
        background: var(--color-surface-hover);
        border-radius: 6px;
        border: 1px dashed var(--color-border);
      }

      .removable-tag {
        cursor: pointer;
      }

      .removable-tag:hover {
        opacity: 0.8;
      }

      .remove-icon {
        margin-left: 4px;
        font-weight: bold;
        font-size: 1.1em;
        line-height: 1;
      }

      .tags-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 0.5rem;
        overflow-y: auto;
        max-height: 300px; /* Fixed height as requested */
        padding: 4px;
        border: 1px solid var(--color-border);
        border-radius: 6px;
      }

      .tags-list::-webkit-scrollbar {
        width: 4px;
      }
      .tags-list::-webkit-scrollbar-track {
        background: transparent;
      }
      .tags-list::-webkit-scrollbar-thumb {
        background-color: var(--color-border);
        border-radius: 4px;
      }

      /* Center Content */
      .center-content {
        flex: 1;
        overflow-y: auto;
        min-width: 0; /* Prevent flex item from overflowing */
        padding-right: 0.5rem; /* Add some spacing for scrollbar */
      }

      .content-grid {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding-bottom: 2rem;
      }

      .card-wrapper {
        display: flex;
        flex-direction: column;
      }

      /* Custom Fieldset Styles */
      .edit-card {
        border-radius: 12px;
        padding: 0.8rem 1.2rem 1rem;
        margin: 0;
        min-height: 180px;
        display: flex;
        flex-direction: column;
        transition: all 0.2s ease;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
      }

      .card-legend {
        padding: 0 0.5rem;
        font-size: 0.95rem;
        font-weight: 600;
        display: flex;
        align-items: center;
      }

      .legend-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .required-mark {
        color: var(--color-error);
        margin-left: 2px;
      }

      /* Warning Variant (Yellow) */
      .edit-card.warning {
        border: 1px solid var(--color-warning);
        background-color: color-mix(in srgb, var(--color-warning), transparent 90%);
      }
      .edit-card.warning .card-legend {
        color: var(--color-warning);
      }
      .edit-card.warning .text-area {
        color: var(--color-text);
      }
      .edit-card.warning .text-area::placeholder {
        color: var(--color-text-secondary);
        opacity: 0.7;
      }

      /* Success Variant (Green) */
      .edit-card.success {
        border: 1px solid var(--color-success);
        background-color: color-mix(in srgb, var(--color-success), transparent 90%);
      }
      .edit-card.success .card-legend {
        color: var(--color-success);
      }
      .edit-card.success .text-area {
        color: var(--color-text);
      }
      .edit-card.success .text-area::placeholder {
        color: var(--color-text-secondary);
        opacity: 0.7;
      }

      /* Info Variant (Blue) */
      .edit-card.info {
        border: 1px solid var(--color-primary);
        background-color: color-mix(in srgb, var(--color-primary), transparent 90%);
      }
      .edit-card.info .card-legend {
        color: var(--color-primary);
      }
      .edit-card.info .text-area {
        color: var(--color-text);
      }
      .edit-card.info .text-area::placeholder {
        color: var(--color-text-secondary);
        opacity: 0.7;
      }

      .text-area {
        flex: 1;
        width: 100%;
        min-height: 120px;
        background: transparent;
        border: none;
        resize: vertical;
        outline: none;
        font-size: 0.9rem;
        line-height: 1.5;
        font-family: inherit;
        margin-top: 0.25rem;
      }

      .steps-textarea {
        font-family: 'SF Mono', Monaco, Consolas, monospace;
        line-height: 2;
        padding: 1rem;
        background: linear-gradient(
          to bottom,
          transparent 0,
          transparent calc(2em - 1px),
          var(--color-border) calc(2em - 1px),
          var(--color-border) 2em
        );
        background-size: 100% 2em;
        background-attachment: local;
        border-radius: 8px;
        font-size: 0.95rem;
        color: var(--color-text);
      }

      .steps-textarea::placeholder {
        color: var(--color-text-secondary);
        opacity: 0.6;
      }

      /* 附件区域 */
      .attachments-area {
        padding: 0.5rem 0;
      }

      .attachments-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 0.75rem;
      }

      .attachment-item {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.5rem;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        transition: all 0.15s ease;
      }

      .attachment-item:hover {
        border-color: var(--color-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .attachment-preview {
        width: 80px;
        height: 60px;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-background);
      }

      .attachment-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .video-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .attachment-name {
        font-size: 0.75rem;
        color: var(--color-text-secondary);
        text-align: center;
        max-width: 90px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .remove-attachment {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        border: none;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      .attachment-item:hover .remove-attachment {
        opacity: 1;
      }

      .add-attachment {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        padding: 1rem;
        min-height: 100px;
        background: var(--color-surface);
        border: 2px dashed var(--color-border);
        border-radius: 8px;
        cursor: pointer;
        color: var(--color-text-secondary);
        font-size: 0.75rem;
        transition: all 0.15s ease;
      }

      .add-attachment:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: color-mix(in srgb, var(--color-primary), transparent 95%);
      }

      /* Right Sidebar */
      .right-sidebar {
        width: 50%;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        transition: width 0.3s ease;
      }

      .right-sidebar.fullscreen-mode {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 1000;
        background: var(--color-background);
        padding: 0;
      }

      .flowchart-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        flex-shrink: 0;
      }

      .flowchart-title {
        font-weight: 600;
        font-size: 0.95rem;
      }

      .flowchart-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .flowchart-container {
        flex: 1;
        overflow: hidden;
      }

      .full-height-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Ensure inner card structure takes full height */
      .full-height-card ::ng-deep .card {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: var(--color-surface);
        border-color: var(--color-border);
      }

      .full-height-card ::ng-deep .card-body {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .icon-btn {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.8rem;
      }

      .editor-container {
        background: #0f172a; /* Keep dark for code editor */
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        flex: 1;
        min-height: 200px;
        overflow: hidden;
        border: 1px solid var(--color-border);
      }

      .code-editor {
        display: flex;
        height: 100%;
        gap: 1rem;
      }

      .line-numbers {
        display: flex;
        flex-direction: column;
        color: #475569;
        font-family: monospace;
        font-size: 0.85rem;
        line-height: 1.5;
        text-align: right;
        user-select: none;
      }

      .code-textarea {
        flex: 1;
        background: transparent;
        border: none;
        color: #e2e8f0; // text-slate-200
        font-family: monospace;
        font-size: 0.85rem;
        line-height: 1.5;
        resize: none;
        outline: none;
        white-space: pre;
      }

      .preview-container {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        flex: 1;
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      /* 预览覆盖层 */
      .attachment-preview {
        cursor: pointer;
        position: relative;
      }

      .preview-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        opacity: 0;
        transition: opacity 0.2s ease;
      }

      .attachment-preview:hover .preview-overlay {
        opacity: 1;
      }

      /* 预览 Modal */
      .preview-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
      }

      .preview-modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .preview-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        transition: color 0.2s ease;
      }

      .preview-close:hover {
        color: var(--color-primary);
      }

      .preview-body {
        display: flex;
        align-items: center;
        justify-content: center;
        max-width: 100%;
        max-height: calc(90vh - 80px);
      }

      .preview-image {
        max-width: 100%;
        max-height: calc(90vh - 80px);
        object-fit: contain;
        border-radius: 4px;
      }

      .preview-video {
        max-width: 100%;
        max-height: calc(90vh - 80px);
        border-radius: 4px;
      }

      .preview-footer {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        color: white;
      }

      .preview-name {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .preview-nav {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .nav-btn {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .nav-btn:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
      }

      .nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .preview-counter {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.6);
        min-width: 60px;
        text-align: center;
      }

      /* Markdown 占位符样式 */
      .markdown-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background: linear-gradient(135deg, #1a365d, #2c5282);
        color: white;
      }

      .markdown-placeholder .file-ext {
        font-size: 0.75rem;
        font-weight: 600;
        opacity: 0.8;
      }

      /* Markdown 预览 Modal 样式 */
      .preview-modal.markdown-mode .preview-body {
        flex-direction: column;
        width: 100%;
      }

      .preview-modal-content.wide {
        max-width: 900px;
        width: 90vw;
      }

      .markdown-preview {
        background: #1e1e1e;
        border-radius: 12px;
        padding: 1.5rem;
        max-height: 70vh;
        overflow-y: auto;
        width: 100%;
      }

      .markdown-content {
        margin: 0;
        color: #d4d4d4;
        font-family: 'SF Mono', Monaco, Consolas, monospace;
        font-size: 0.9rem;
        line-height: 1.7;
        white-space: pre-wrap;
        word-break: break-word;
      }

      @media (max-width: 1200px) {
        .main-layout {
          flex-direction: column;
          overflow-y: auto;
        }
        .left-sidebar,
        .right-sidebar {
          width: 100%;
          flex: none;
        }
        .content-grid {
          grid-template-columns: 1fr;
          grid-template-rows: auto;
        }
      }
    `,
  ],
})
export class FaqEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private faqService = inject(FaqService);
  private configService = inject(ConfigService);
  private messageService = inject(MessageService);

  isEdit = false;
  faqId: string | null = null;
  faqData?: FaqItem;
  showFlowchart = true;
  isFullscreen = false;

  // 流程图数据
  flowchartData: FlowchartData = { nodes: [], connections: [] };

  // 附件数据
  attachments: { id: string; name: string; type: 'image' | 'video' | 'markdown'; url: string; file?: File; content?: string }[] = [];
  private imageCount = 0;
  private videoCount = 0;
  private markdownCount = 0;

  // 预览状态
  previewAttachment: { id: string; name: string; type: 'image' | 'video' | 'markdown'; url: string; content?: string } | null = null;
  currentPreviewIndex = 0;

  formData: Partial<FaqItem> & { tags: string[] } = {
    title: '',
    component: '',
    version: '',
    tags: [],
    summary: '',
    phenomenon: '1. ',
    solution: '',
    troubleshootingFlow: '',
  };

  moduleOptions: { label: string; value: string }[] = [];
  tagOptions: { label: string; value: string }[] = [];
  versionOptions: { label: string; value: string }[] = [];

  ngOnInit() {
    // 加载配置数据
    this.loadConfigData();

    this.faqId = this.route.snapshot.paramMap.get('id');
    if (this.faqId) {
      this.isEdit = true;
      this.faqService.getById(this.faqId).subscribe((data) => {
        this.faqData = data;
        this.formData = { ...data, tags: data.tags || [] };
        // 尝试解析已保存的流程图数据
        if (data.troubleshootingFlow) {
          try {
            this.flowchartData = JSON.parse(data.troubleshootingFlow);
          } catch {
            // 如果解析失败，保持空流程图
            this.flowchartData = { nodes: [], connections: [] };
          }
        }
      });
    }
  }

  // 流程图数据变化时更新
  onFlowchartChange(data: FlowchartData) {
    this.flowchartData = data;
    // 将流程图数据序列化存储
    this.formData.troubleshootingFlow = JSON.stringify(data);
  }

  private loadConfigData() {
    this.configService.getModuleOptions().subscribe((options) => {
      this.moduleOptions = options;
    });
    this.configService.getTagOptions().subscribe((options) => {
      this.tagOptions = options;
    });
    this.configService.getVersionOptions().subscribe((options) => {
      this.versionOptions = options;
    });
  }

  isTagSelected(tag: string): boolean {
    return this.formData.tags.includes(tag);
  }

  toggleTag(tag: string) {
    const index = this.formData.tags.indexOf(tag);
    if (index > -1) {
      this.formData.tags.splice(index, 1);
    } else {
      this.formData.tags.push(tag);
    }
  }

  // 复刻步骤自动编号
  onStepsKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const textarea = event.target as HTMLTextAreaElement;
      const value = textarea.value;
      const cursorPos = textarea.selectionStart;
      
      // 找到当前行的编号
      const beforeCursor = value.substring(0, cursorPos);
      const lines = beforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];
      const match = currentLine.match(/^(\d+)\.\s*/);
      
      let nextNumber = 1;
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      } else {
        // 如果当前行没有编号，查找最后一个编号
        for (let i = lines.length - 1; i >= 0; i--) {
          const lineMatch = lines[i].match(/^(\d+)\.\s*/);
          if (lineMatch) {
            nextNumber = parseInt(lineMatch[1], 10) + 1;
            break;
          }
        }
      }
      
      // 插入新行和编号
      const newLine = `\n${nextNumber}. `;
      const afterCursor = value.substring(cursorPos);
      this.formData.phenomenon = beforeCursor + newLine + afterCursor;
      
      // 设置光标位置
      setTimeout(() => {
        const newPos = cursorPos + newLine.length;
        textarea.selectionStart = newPos;
        textarea.selectionEnd = newPos;
      });
    }
  }

  // 文件选择处理
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    Array.from(input.files).forEach((file) => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type === 'text/markdown';
      
      if (!isImage && !isVideo && !isMarkdown) return;

      const type: 'image' | 'video' | 'markdown' = isImage ? 'image' : isVideo ? 'video' : 'markdown';
      let count: number;
      let name: string;
      
      if (isImage) {
        count = ++this.imageCount;
        name = `图 ${count}`;
      } else if (isVideo) {
        count = ++this.videoCount;
        name = `视频 ${count}`;
      } else {
        count = ++this.markdownCount;
        name = file.name; // 保留原始文件名
      }
      
      const url = URL.createObjectURL(file);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (isMarkdown) {
        // 读取 markdown 文件内容
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          this.attachments.push({
            id,
            name,
            type,
            url,
            file,
            content,
          });
        };
        reader.readAsText(file);
      } else {
        this.attachments.push({
          id,
          name,
          type,
          url,
          file,
        });
      }
    });

    // 重置 input
    input.value = '';
  }

  // 删除附件
  removeAttachment(index: number) {
    const attachment = this.attachments[index];
    if (attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
    this.attachments.splice(index, 1);
  }

  // 打开预览
  openPreview(attachment: { id: string; name: string; type: 'image' | 'video' | 'markdown'; url: string; content?: string }) {
    this.previewAttachment = attachment;
    this.currentPreviewIndex = this.attachments.findIndex((a) => a.id === attachment.id);
  }

  // 关闭预览
  closePreview() {
    this.previewAttachment = null;
  }

  // 上一张
  prevPreview() {
    if (this.currentPreviewIndex > 0) {
      this.currentPreviewIndex--;
      this.previewAttachment = this.attachments[this.currentPreviewIndex];
    }
  }

  // 下一张
  nextPreview() {
    if (this.currentPreviewIndex < this.attachments.length - 1) {
      this.currentPreviewIndex++;
      this.previewAttachment = this.attachments[this.currentPreviewIndex];
    }
  }

  toggleFlowchart() {
    this.showFlowchart = !this.showFlowchart;
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
  }

  onSave() {
    if (
      !this.formData.title ||
      !this.formData.component ||
      !this.formData.tags.length ||
      !this.formData.summary ||
      !this.formData.phenomenon ||
      !this.formData.solution
    ) {
      this.messageService.warning('请填写所有必填字段');
      return;
    }

    const errorCode = this.generateErrorCode(this.formData.component || '', this.formData.tags);
    const faqData: Partial<FaqItem> = {
      ...this.formData,
      errorCode,
      views: this.faqData?.views || 0,
      solveTimeMinutes: this.faqData?.solveTimeMinutes || 0,
    };

    if (this.isEdit && this.faqId) {
      this.faqService.update(this.faqId, faqData).subscribe(() => {
        this.router.navigate(['/detail', this.faqId]);
      });
    } else {
      this.faqService.create(faqData).subscribe((newFaq) => {
        if (newFaq && newFaq.id) {
          this.router.navigate(['/detail', newFaq.id]);
        } else {
          this.router.navigate(['/']);
        }
      });
    }
  }

  private generateErrorCode(module: string, tags: string[]): string {
    const modulePrefix = module.toUpperCase().substring(0, 3);
    const tagPrefix = tags.length > 0 ? tags[0].substring(0, 3).toUpperCase() : 'GEN';
    const timestamp = Date.now().toString().slice(-4);
    return `${modulePrefix}_${tagPrefix}_${timestamp}`;
  }

  onCancel() {
    if (this.isEdit && this.faqId) {
      this.router.navigate(['/detail', this.faqId]);
    } else {
      this.router.navigate(['/']);
    }
  }
}
