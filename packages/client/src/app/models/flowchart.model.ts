/** 节点类型 */
export type FlowNodeType = 'start' | 'process' | 'decision' | 'end';

/** 连接点位置 */
export type ConnectorPosition = 'top' | 'right' | 'bottom' | 'left';

/** 流程图节点 */
export interface FlowNode {
  id: string;
  type: FlowNodeType;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
}

/** 连接点 */
export interface Connector {
  nodeId: string;
  position: ConnectorPosition;
}

/** 流程图连接 */
export interface FlowConnection {
  id: string;
  from: Connector;
  to: Connector;
  text?: string;
}

/** 历史状态 (用于撤销/重做) */
export interface HistoryState {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

/** 流程图数据 */
export interface FlowchartData {
  nodes: FlowNode[];
  connections: FlowConnection[];
}

/** 连接路径数据 */
export interface ConnectionPath {
  connection: FlowConnection;
  d: string;
  labelX: number;
  labelY: number;
}

/** 节点默认配置 */
export const NODE_DEFAULTS: Record<FlowNodeType, { width: number; height: number; fillColor: string; strokeColor: string }> = {
  start: { width: 120, height: 50, fillColor: '#10b981', strokeColor: '#059669' },
  process: { width: 140, height: 60, fillColor: '#3b82f6', strokeColor: '#2563eb' },
  decision: { width: 140, height: 80, fillColor: '#f59e0b', strokeColor: '#d97706' },
  end: { width: 120, height: 50, fillColor: '#ef4444', strokeColor: '#dc2626' },
};

/** 预设颜色 */
export const PRESET_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#22c55e', '#0ea5e9', '#eab308',
];
