export interface FaqAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'markdown';
  url: string;
  content?: string; // For markdown content
}

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
  troubleshootingFlow: string; // Mermaid graph string
  validationMethod: string;
  views: number;
  solveTimeMinutes: number;
  author?: string;
  createTime?: string;
  status?: 'resolved' | 'pending' | 'closed';
  contributors?: string[];
  attachments?: FaqAttachment[];
}
