import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlowNodeType, PRESET_COLORS } from '../../../models';

export interface NodeData {
  id: string;
  text: string;
  flowType: FlowNodeType;
  imageUrl?: string;
}

export interface NodeAttachment {
  id: string;
  name: string;
  type: 'image' | 'video';
  url: string;
}

@Component({
  selector: 'app-property-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-panel.component.html',
  styleUrls: ['./property-panel.component.scss'],
})
export class PropertyPanelComponent {
  nodeData = input<NodeData | null>(null);
  
  @Output() panelClose = new EventEmitter<void>();
  @Output() textChange = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();
  @Output() fillColorChange = new EventEmitter<string>();
  @Output() strokeColorChange = new EventEmitter<string>();
  @Output() textColorChange = new EventEmitter<string>();
  @Output() attachmentsChange = new EventEmitter<NodeAttachment[]>();
  @Output() deleteNode = new EventEmitter<void>();

  readonly presetColors = PRESET_COLORS;
  
  editingText = '';
  editingDescription = '';
  editingFillColor = '';
  editingStrokeColor = '';
  editingTextColor = '#1e293b';
  customColor = '#6366f1';
  colorMode = signal<'fill' | 'stroke' | 'text'>('fill');
  nodeAttachments: NodeAttachment[] = [];

  private readonly nodeTypeLabels: Record<string, string> = {
    start: '开始',
    process: '流程',
    decision: '判断',
    end: '结束',
    image: '图片',
  };

  getNodeTypeLabel(type?: string): string {
    return this.nodeTypeLabels[type || ''] || '未知';
  }

  setColorMode(mode: 'fill' | 'stroke' | 'text') {
    this.colorMode.set(mode);
  }

  getCurrentColor(): string {
    switch (this.colorMode()) {
      case 'fill': return this.editingFillColor;
      case 'stroke': return this.editingStrokeColor;
      case 'text': return this.editingTextColor;
    }
  }

  updateColor(color: string) {
    switch (this.colorMode()) {
      case 'fill':
        this.editingFillColor = color;
        this.fillColorChange.emit(color);
        break;
      case 'stroke':
        this.editingStrokeColor = color;
        this.strokeColorChange.emit(color);
        break;
      case 'text':
        this.editingTextColor = color;
        this.textColorChange.emit(color);
        break;
    }
  }

  onCustomColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.customColor = input.value;
    this.updateColor(input.value);
  }

  onTextBlur() {
    this.textChange.emit(this.editingText);
  }

  onDescriptionBlur() {
    this.descriptionChange.emit(this.editingDescription);
  }

  onAttachmentSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach((file) => {
        const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        const reader = new FileReader();
        reader.onload = (e) => {
          this.nodeAttachments.push({
            id,
            name: file.name,
            type,
            url: e.target?.result as string,
          });
          this.attachmentsChange.emit([...this.nodeAttachments]);
        };
        reader.readAsDataURL(file);
      });
    }
    input.value = '';
  }

  removeAttachment(index: number) {
    this.nodeAttachments.splice(index, 1);
    this.attachmentsChange.emit([...this.nodeAttachments]);
  }

  updateAttachmentName() {
    this.attachmentsChange.emit([...this.nodeAttachments]);
  }

  onClose() {
    this.panelClose.emit();
  }

  onDelete() {
    this.deleteNode.emit();
  }

  // 初始化数据
  initData(data: {
    text: string;
    description: string;
    fillColor: string;
    strokeColor: string;
    textColor: string;
    attachments: NodeAttachment[];
  }) {
    this.editingText = data.text;
    this.editingDescription = data.description;
    this.editingFillColor = data.fillColor;
    this.editingStrokeColor = data.strokeColor;
    this.editingTextColor = data.textColor;
    this.nodeAttachments = [...data.attachments];
  }
}
