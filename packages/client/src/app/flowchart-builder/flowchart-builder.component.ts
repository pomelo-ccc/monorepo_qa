import {
  Component,
  ElementRef,
  ViewChild,
  input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  signal,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import LogicFlow from '@logicflow/core';
import { Menu } from '@logicflow/extension';
import { FlowNode, FlowConnection, FlowNodeType, FlowchartData, PRESET_COLORS } from '../models';

// 自定义节点类型映射 - 浅色背景 + 彩色左边框风格
const NODE_STYLES: Record<FlowNodeType, { fill: string; stroke: string }> = {
  start: { fill: '#dcfce7', stroke: '#22c55e' },      // 浅绿背景 + 绿色边框
  process: { fill: '#dbeafe', stroke: '#3b82f6' },    // 浅蓝背景 + 蓝色边框
  decision: { fill: '#fef3c7', stroke: '#f59e0b' },   // 浅黄背景 + 橙色边框
  end: { fill: '#fee2e2', stroke: '#ef4444' },        // 浅红背景 + 红色边框
  image: { fill: '#f1f5f9', stroke: '#64748b' },      // 浅灰背景 + 灰色边框
};

interface GraphData {
  nodes: {
    id: string;
    type: string;
    x: number;
    y: number;
    text?: string | { value: string };
    properties?: Record<string, unknown>;
  }[];
  edges: {
    id: string;
    type: string;
    sourceNodeId: string;
    targetNodeId: string;
    text?: string;
  }[];
}

@Component({
  selector: 'app-flowchart-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flowchart-builder.component.html',
  styleUrls: ['./flowchart-builder.component.scss'],
})
export class FlowchartBuilderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer') canvasContainer!: ElementRef<HTMLDivElement>;

  // Signal-based inputs
  data = input<FlowchartData | null>(null);
  readonly = input(false);
  @Output() dataChange = new EventEmitter<FlowchartData>();

  readonly presetColors = PRESET_COLORS;
  private lf!: LogicFlow;
  private resizeObserver: ResizeObserver | null = null;
  private initialized = false;

  constructor() {
    // 监听 data 变化
    effect(() => {
      const newData = this.data();
      if (newData && this.initialized) {
        this.loadData(newData);
      }
    });
  }

  viewMode = signal<'visual' | 'code'>('visual');
  zoomPercent = signal(100);
  selectedNodeId = signal<string | null>(null);
  selectedNodeData = signal<{ id: string; text: string; flowType: FlowNodeType; imageUrl?: string } | null>(null);
  editingText = '';
  editingDescription = '';
  editingFillColor = '';
  editingStrokeColor = '';
  editingTextColor = '#1e293b';
  editingImageUrl = '';
  colorMode = signal<'fill' | 'stroke' | 'text'>('fill');
  customColor = '#6366f1';
  nodeAttachments: { id: string; name: string; type: 'image' | 'video'; url: string }[] = [];
  previewingAttachment: { id: string; name: string; type: 'image' | 'video'; url: string } | null = null;
  tooltipVisible = signal(false);
  tooltipContent = signal('');
  tooltipPosition = signal({ x: 0, y: 0 });
  codeContent = signal('');
  codeError = signal<string | null>(null);

  showImport = signal(false);
  showAiHelp = signal(false);
  importCode = '';
  importError = signal<string | null>(null);
  promptCopied = signal(false);
  exampleCopied = signal(false);

  readonly aiPrompt = `请帮我生成一个流程图的 JSON 数据，格式要求如下：
{
  "nodes": [
    { "id": "唯一ID", "type": "start|process|decision|end", "text": "节点文字", "x": 数字, "y": 数字 }
  ],
  "connections": [
    { "id": "唯一ID", "from": { "nodeId": "源节点ID" }, "to": { "nodeId": "目标节点ID" } }
  ]
}`;

  readonly exampleCode = `{
  "nodes": [
    { "id": "1", "type": "start", "text": "属性不生效问题", "x": 400, "y": 60 },
    { "id": "2", "type": "process", "text": "打开网络页签，查看接口返回数据", "x": 400, "y": 170 },
    { "id": "3", "type": "decision", "text": "有对应属性?", "x": 400, "y": 300 },
    { "id": "4", "type": "end", "text": "需要配置模型", "x": 150, "y": 300 },
    { "id": "5", "type": "process", "text": "Source页签 → main文件 → 搜索函数 → 打断点", "x": 400, "y": 440 },
    { "id": "6", "type": "decision", "text": "入参对的上?", "x": 400, "y": 570 },
    { "id": "7", "type": "end", "text": "父容器问题", "x": 150, "y": 570 },
    { "id": "8", "type": "process", "text": "继续搜索xxx → 查看表达式执行结果", "x": 400, "y": 700 },
    { "id": "9", "type": "end", "text": "根据表达式与行数据计算", "x": 400, "y": 820 }
  ],
  "connections": [
    { "id": "c1", "from": { "nodeId": "1" }, "to": { "nodeId": "2" } },
    { "id": "c2", "from": { "nodeId": "2" }, "to": { "nodeId": "3" } },
    { "id": "c3", "from": { "nodeId": "3" }, "to": { "nodeId": "4" }, "text": "没有" },
    { "id": "c4", "from": { "nodeId": "3" }, "to": { "nodeId": "5" }, "text": "有" },
    { "id": "c5", "from": { "nodeId": "5" }, "to": { "nodeId": "6" } },
    { "id": "c6", "from": { "nodeId": "6" }, "to": { "nodeId": "7" }, "text": "对不上" },
    { "id": "c7", "from": { "nodeId": "6" }, "to": { "nodeId": "8" }, "text": "对的上" },
    { "id": "c8", "from": { "nodeId": "8" }, "to": { "nodeId": "9" } }
  ]
}`;

  codeLineNumbers = computed(() => {
    const lines = this.codeContent().split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });

  ngAfterViewInit() {
    // 延迟初始化确保容器有尺寸
    setTimeout(() => {
      this.initLogicFlow();
      this.initialized = true;
      // 初始化后加载数据
      const currentData = this.data();
      if (currentData) {
        this.loadData(currentData);
      }
    }, 50);

    // 监听容器尺寸变化
    this.resizeObserver = new ResizeObserver(() => {
      if (this.lf) {
        this.lf.resize();
      }
    });
    this.resizeObserver.observe(this.canvasContainer.nativeElement);

    // 监听全屏变化
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  private onFullscreenChange = () => {
    // 全屏变化后延迟重新设置宽高
    setTimeout(() => {
      if (this.lf) {
        const container = this.canvasContainer.nativeElement;
        const width = container.clientWidth;
        const height = container.clientHeight;
        this.lf.resize(width, height);
      }
    }, 150);
  };

  private initLogicFlow() {
    const container = this.canvasContainer.nativeElement;
    // 设置明确的宽高
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 400;

    // 注册插件
    LogicFlow.use(Menu);

    this.lf = new LogicFlow({
      container,
      width,
      height,
      grid: {
        size: 20,
        visible: true,
        type: 'dot',
        config: {
          color: '#e0e0e0',
        },
      },
      background: {
        backgroundColor: '#f8fafc',
      },
      keyboard: {
        enabled: !this.readonly(),
      },
      edgeTextDraggable: true, // 允许拖动边文字
      nodeTextDraggable: false,
      textEdit: !this.readonly(), // 允许编辑边的文字
      isSilentMode: this.readonly(),
      stopZoomGraph: false,
      stopScrollGraph: false,
      stopMoveGraph: false,
      multipleSelectKey: '', // 禁用多选
    });

    // 使用主题设置节点样式 - 浅色背景 + 深色文字
    this.lf.setTheme({
      rect: {
        fill: NODE_STYLES.process.fill,
        stroke: NODE_STYLES.process.stroke,
        strokeWidth: 2,
        radius: 6,
        width: 180,
        height: 50,
      },
      ellipse: {
        fill: NODE_STYLES.start.fill,
        stroke: NODE_STYLES.start.stroke,
        strokeWidth: 2,
        rx: 70,
        ry: 30,
      },
      diamond: {
        fill: NODE_STYLES.decision.fill,
        stroke: NODE_STYLES.decision.stroke,
        strokeWidth: 2,
        rx: 80,
        ry: 45,
      },
      nodeText: {
        color: '#1e293b', // 深色文字
        fontSize: 13,
        overflowMode: 'autoWrap',
        lineHeight: 1.4,
      },
      polyline: {
        stroke: '#94a3b8',
        strokeWidth: 1.5,
      },
      edgeText: {
        textWidth: 80,
        fontSize: 12,
        color: '#475569',
        background: {
          fill: '#f8fafc',
          stroke: '#e2e8f0',
          radius: 4,
        },
      },
      arrow: {
        offset: 4,
        verticalLength: 2,
      },
    });

    this.lf.setDefaultEdgeType('polyline');

    // 配置节点右键菜单
    if (!this.readonly()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const menu = (this.lf.extension as any).menu;
      if (menu?.setMenuConfig) {
        menu.setMenuConfig({
          nodeMenu: [
            {
              text: '删除',
              callback: (node: { id: string }) => {
                this.lf.deleteNode(node.id);
                this.selectedNodeId.set(null);
                this.selectedNodeData.set(null);
                this.emitDataChange();
              },
            },
          ],
          edgeMenu: [
            {
              text: '删除',
              callback: (edge: { id: string }) => {
                this.lf.deleteEdge(edge.id);
                this.emitDataChange();
              },
            },
          ],
        });
      }
    }

    this.lf.render({});

    // 禁用节点双击编辑（只允许边的文字编辑）
    this.lf.on('node:dblclick', () => {
      // 延迟关闭文字编辑状态
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.lf.graphModel as any).setTextEditable(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTimeout(() => (this.lf.graphModel as any).setTextEditable(true), 0);
      }, 0);
    });

    // 事件监听
    this.lf.on('node:click', ({ data }: { data: { id: string; text?: { value: string }; properties?: Record<string, unknown> } }) => {
      this.selectedNodeId.set(data.id);
      const flowType = (data.properties?.['flowType'] as FlowNodeType) || 'process';
      const text = typeof data.text === 'object' ? data.text?.value || '' : '';
      const imageUrl = (data.properties?.['imageUrl'] as string) || '';
      const style = data.properties?.['style'] as { fill?: string; stroke?: string } | undefined;
      const textColor = (data.properties?.['textColor'] as string) || '#1e293b';
      const description = (data.properties?.['description'] as string) || '';
      const attachments = (data.properties?.['attachments'] as { id: string; name: string; type: 'image' | 'video'; url: string }[]) || [];
      this.selectedNodeData.set({ id: data.id, text, flowType, imageUrl });
      this.editingText = text;
      this.editingDescription = description;
      this.editingFillColor = style?.fill || NODE_STYLES[flowType].fill;
      this.editingStrokeColor = style?.stroke || NODE_STYLES[flowType].stroke;
      this.editingTextColor = textColor;
      this.editingImageUrl = imageUrl;
      this.nodeAttachments = [...attachments];
    });

    this.lf.on('blank:click', () => {
      this.selectedNodeId.set(null);
      this.selectedNodeData.set(null);
    });

    this.lf.on('history:change', () => {
      this.emitDataChange();
    });

    // 节点悬浮显示描述
    this.lf.on('node:mouseenter', ({ data, e }: { data: { properties?: Record<string, unknown> }; e: MouseEvent }) => {
      const description = data.properties?.['description'] as string;
      if (description) {
        this.tooltipContent.set(description);
        this.tooltipPosition.set({ x: e.clientX + 10, y: e.clientY + 10 });
        this.tooltipVisible.set(true);
      }
    });

    this.lf.on('node:mouseleave', () => {
      this.tooltipVisible.set(false);
    });
  }

  private getNodeType(flowType: FlowNodeType): string {
    const typeMap: Record<FlowNodeType, string> = {
      start: 'ellipse',
      process: 'rect',
      decision: 'diamond',
      end: 'ellipse',
      image: 'rect',
    };
    return typeMap[flowType];
  }

  addNode(type: FlowNodeType) {
    const textMap: Record<FlowNodeType, string> = {
      start: '开始',
      process: '流程步骤',
      decision: '条件判断?',
      end: '结束',
      image: '点击上传图片',
    };
    
    const { transformModel } = this.lf.graphModel;
    const centerX = (-transformModel.TRANSLATE_X + this.canvasContainer.nativeElement.clientWidth / 2) / transformModel.SCALE_X;
    const centerY = (-transformModel.TRANSLATE_Y + this.canvasContainer.nativeElement.clientHeight / 2) / transformModel.SCALE_Y;
    
    const nodeType = this.getNodeType(type);
    const style = NODE_STYLES[type];
    
    // 图片节点使用更大的尺寸
    const properties: Record<string, unknown> = {
      flowType: type,
      style: {
        fill: style.fill,
        stroke: style.stroke,
      },
    };

    // 图片节点特殊配置
    if (type === 'image') {
      properties['width'] = 200;
      properties['height'] = 150;
    }

    this.lf.addNode({
      type: nodeType,
      x: centerX + Math.random() * 50 - 25,
      y: centerY + Math.random() * 50 - 25,
      text: textMap[type],
      properties,
    });
    this.emitDataChange();
  }

  deleteSelected() {
    const nodeId = this.selectedNodeId();
    if (nodeId) {
      this.lf.deleteNode(nodeId);
      this.selectedNodeId.set(null);
      this.selectedNodeData.set(null);
      this.emitDataChange();
    }
  }

  undo() {
    this.lf.undo();
  }

  redo() {
    this.lf.redo();
  }

  zoomIn() {
    this.lf.zoom(true);
  }

  zoomOut() {
    this.lf.zoom(false);
  }

  resetView() {
    this.lf.resetZoom();
    this.lf.resetTranslate();
    this.zoomPercent.set(100);
  }

  clearSelection() {
    this.selectedNodeId.set(null);
  }

  setViewMode(mode: 'visual' | 'code') {
    if (mode === 'code') {
      this.updateCodeContent();
    }
    this.viewMode.set(mode);
  }

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
        throw new Error('数据格式错误');
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

  copyExample() {
    navigator.clipboard.writeText(this.exampleCode).then(() => {
      this.exampleCopied.set(true);
      setTimeout(() => this.exampleCopied.set(false), 2000);
    });
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

  private updateCodeContent() {
    this.codeContent.set(JSON.stringify(this.getFlowchartData(), null, 2));
  }

  private getFlowchartData(): FlowchartData {
    const graphData = this.lf.getGraphData() as GraphData;
    const nodes: FlowNode[] = [];
    const connections: FlowConnection[] = [];

    (graphData.nodes || []).forEach((node) => {
      const props = node.properties || {};
      const flowType = (props['flowType'] as FlowNodeType) || this.inferFlowType(node.type);
      const text = typeof node.text === 'string' ? node.text : node.text?.value || '';
      const savedStyle = props['style'] as { fill?: string; stroke?: string } | undefined;
      const defaultStyle = NODE_STYLES[flowType];
      const imageUrl = props['imageUrl'] as string | undefined;
      
      nodes.push({
        id: node.id,
        type: flowType,
        text: text,
        x: node.x,
        y: node.y,
        width: 120,
        height: 50,
        fillColor: savedStyle?.fill || defaultStyle.fill,
        strokeColor: savedStyle?.stroke || defaultStyle.stroke,
        imageUrl: imageUrl,
      });
    });

    (graphData.edges || []).forEach((edge) => {
      connections.push({
        id: edge.id,
        from: { nodeId: edge.sourceNodeId, position: 'bottom' },
        to: { nodeId: edge.targetNodeId, position: 'top' },
        text: edge.text,
      });
    });

    return { nodes, connections };
  }

  private inferFlowType(nodeType: string): FlowNodeType {
    if (nodeType === 'ellipse') return 'start';
    if (nodeType === 'diamond') return 'decision';
    return 'process';
  }

  private loadData(data: FlowchartData) {
    const graphData = {
      nodes: data.nodes.map((node) => {
        const lfType = this.getNodeType(node.type);
        const defaultStyle = NODE_STYLES[node.type];
        // 使用保存的颜色，否则使用默认颜色
        const fill = node.fillColor || defaultStyle.fill;
        const stroke = node.strokeColor || defaultStyle.stroke;
        return {
          id: node.id,
          type: lfType,
          x: node.x,
          y: node.y,
          text: node.text,
          properties: {
            flowType: node.type,
            imageUrl: node.imageUrl,
            style: {
              fill,
              stroke,
            },
          },
        };
      }),
      edges: data.connections.map((conn) => ({
        id: conn.id,
        type: 'polyline',
        sourceNodeId: conn.from.nodeId,
        targetNodeId: conn.to.nodeId,
        text: conn.text || '',
      })),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.lf.render(graphData as any);
    
    // 渲染后应用自定义样式
    setTimeout(() => {
      data.nodes.forEach((node) => {
        const nodeModel = this.lf.getNodeModelById(node.id);
        if (nodeModel) {
          const fill = node.fillColor || NODE_STYLES[node.type].fill;
          const stroke = node.strokeColor || NODE_STYLES[node.type].stroke;
          nodeModel.setStyle('fill', fill);
          nodeModel.setStyle('stroke', stroke);
        }
      });
    }, 0);
  }

  private emitDataChange() {
    this.dataChange.emit(this.getFlowchartData());
  }

  // 节点编辑功能
  updateNodeText() {
    const nodeData = this.selectedNodeData();
    if (nodeData && this.editingText) {
      const nodeModel = this.lf.getNodeModelById(nodeData.id);
      if (nodeModel) {
        nodeModel.updateText(this.editingText);
        this.selectedNodeData.set({ ...nodeData, text: this.editingText });
        this.emitDataChange();
      }
    }
  }

  updateNodeDescription() {
    const nodeData = this.selectedNodeData();
    if (nodeData) {
      const nodeModel = this.lf.getNodeModelById(nodeData.id);
      if (nodeModel) {
        nodeModel.setProperties({
          ...nodeModel.properties,
          description: this.editingDescription,
        });
        this.emitDataChange();
      }
    }
  }

  updateNodeFillColor(color: string) {
    const nodeData = this.selectedNodeData();
    if (nodeData) {
      this.editingFillColor = color;
      const nodeModel = this.lf.getNodeModelById(nodeData.id);
      if (nodeModel) {
        nodeModel.setProperties({
          ...nodeModel.properties,
          style: { ...((nodeModel.properties as Record<string, unknown>)['style'] as object || {}), fill: color },
        });
        nodeModel.setStyle('fill', color);
        this.emitDataChange();
      }
    }
  }

  updateNodeStrokeColor(color: string) {
    const nodeData = this.selectedNodeData();
    if (nodeData) {
      this.editingStrokeColor = color;
      const nodeModel = this.lf.getNodeModelById(nodeData.id);
      if (nodeModel) {
        nodeModel.setProperties({
          ...nodeModel.properties,
          style: { ...((nodeModel.properties as Record<string, unknown>)['style'] as object || {}), stroke: color },
        });
        nodeModel.setStyle('stroke', color);
        this.emitDataChange();
      }
    }
  }

  updateNodeTextColor(color: string) {
    const nodeData = this.selectedNodeData();
    if (nodeData) {
      this.editingTextColor = color;
      const nodeModel = this.lf.getNodeModelById(nodeData.id);
      if (nodeModel) {
        nodeModel.setProperties({
          ...nodeModel.properties,
          textColor: color,
        });
        // 使用 LogicFlow 的文字样式 API
        nodeModel.setStyle('nodeTextStyle', { color });
        // 同时更新 DOM 元素
        setTimeout(() => {
          const nodeElement = document.querySelector(`g[data-id="${nodeData.id}"]`);
          if (nodeElement) {
            const textElements = nodeElement.querySelectorAll('text, tspan');
            textElements.forEach((el) => {
              (el as SVGElement).style.fill = color;
              el.setAttribute('fill', color);
            });
          }
        }, 0);
        this.emitDataChange();
      }
    }
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

  updateNodeColorByMode(color: string) {
    switch (this.colorMode()) {
      case 'fill':
        this.updateNodeFillColor(color);
        break;
      case 'stroke':
        this.updateNodeStrokeColor(color);
        break;
      case 'text':
        this.updateNodeTextColor(color);
        break;
    }
  }

  onCustomColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.customColor = input.value;
    this.updateNodeColorByMode(input.value);
  }

  closePropertyPanel() {
    this.selectedNodeId.set(null);
    this.selectedNodeData.set(null);
  }

  getNodeTypeLabel(type?: string): string {
    const labels: Record<string, string> = { start: '开始', process: '流程', decision: '判断', end: '结束', image: '图片' };
    return labels[type || ''] || '未知';
  }

  // 图片上传处理
  onImageFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        this.updateNodeImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  updateNodeImage(imageUrl: string) {
    const nodeData = this.selectedNodeData();
    if (nodeData) {
      this.editingImageUrl = imageUrl;
      const nodeModel = this.lf.getNodeModelById(nodeData.id);
      if (nodeModel) {
        nodeModel.setProperties({
          ...nodeModel.properties,
          imageUrl,
        });
        this.selectedNodeData.set({ ...nodeData, imageUrl });
        this.emitDataChange();
      }
    }
  }

  // 节点附件处理
  onNodeAttachmentSelect(event: Event) {
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
          this.updateNodeAttachments();
        };
        reader.readAsDataURL(file);
      });
    }
    input.value = '';
  }

  removeNodeAttachment(index: number) {
    this.nodeAttachments.splice(index, 1);
    this.updateNodeAttachments();
  }

  updateNodeAttachments() {
    const nodeData = this.selectedNodeData();
    if (nodeData) {
      const nodeModel = this.lf.getNodeModelById(nodeData.id);
      if (nodeModel) {
        nodeModel.setProperties({
          ...nodeModel.properties,
          attachments: [...this.nodeAttachments],
        });
        this.emitDataChange();
      }
    }
  }

  previewNodeAttachment(att: { id: string; name: string; type: 'image' | 'video'; url: string }) {
    this.previewingAttachment = att;
  }

  closeAttachmentPreview() {
    this.previewingAttachment = null;
  }

  // Compatibility
  canUndo = signal(false);
  canRedo = signal(false);
  selectedNode = signal<unknown>(null);
}
