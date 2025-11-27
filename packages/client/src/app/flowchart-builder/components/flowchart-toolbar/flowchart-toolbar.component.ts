import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowNodeType } from '../../../models';

@Component({
  selector: 'app-flowchart-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flowchart-toolbar.component.html',
  styleUrls: ['./flowchart-toolbar.component.scss'],
})
export class FlowchartToolbarComponent {
  readonly = input(false);
  viewMode = input<'visual' | 'code'>('visual');
  zoomPercent = input(100);
  isFullscreen = input(false);

  @Output() addNode = new EventEmitter<FlowNodeType>();
  @Output() deleteSelected = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() resetView = new EventEmitter<void>();
  @Output() toggleFullscreen = new EventEmitter<void>();
  @Output() viewModeChange = new EventEmitter<'visual' | 'code'>();
  @Output() showImport = new EventEmitter<void>();
  @Output() showAiHelp = new EventEmitter<void>();
  @Output() exportData = new EventEmitter<void>();

  onAddNode(type: FlowNodeType) {
    this.addNode.emit(type);
  }

  onDeleteSelected() {
    this.deleteSelected.emit();
  }

  onUndo() {
    this.undo.emit();
  }

  onRedo() {
    this.redo.emit();
  }

  onZoomIn() {
    this.zoomIn.emit();
  }

  onZoomOut() {
    this.zoomOut.emit();
  }

  onResetView() {
    this.resetView.emit();
  }

  onToggleFullscreen() {
    this.toggleFullscreen.emit();
  }

  setViewMode(mode: 'visual' | 'code') {
    this.viewModeChange.emit(mode);
  }

  onShowImport() {
    this.showImport.emit();
  }

  onShowAiHelp() {
    this.showAiHelp.emit();
  }

  onExportData() {
    this.exportData.emit();
  }
}
