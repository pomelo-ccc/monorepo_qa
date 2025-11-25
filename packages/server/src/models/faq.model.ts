export interface FaqItem {
  id: string;
  title: string;
  component: string;
  version: string;
  tags: string[];
  errorCode?: string;
  summary: string;
  phenomenon: string;
  solution: string;
  troubleshootingFlow: string;
  validationMethod: string;
  views: number;
  solveTimeMinutes: number;
  // 新增字段
  createTime?: string;
  updateTime?: string;
  author?: string;
  status?: 'pending' | 'resolved';
}
