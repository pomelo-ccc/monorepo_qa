// Utility functions
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const isEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Flow diagram helpers
export interface FlowStep {
  id: string;
  label: string;
  type: 'start' | 'process' | 'decision' | 'end';
  nextId?: string;      // For process/start
  yesId?: string;       // For decision
  noId?: string;        // For decision
}

export class FlowGenerator {
  /**
   * Generate Mermaid flowchart from structured steps
   * @param steps Array of flow steps
   * @returns Mermaid graph definition string
   */
  static generateMermaid(steps: FlowStep[]): string {
    if (!steps || steps.length === 0) {
      return 'graph TD;\n  A[Start] --> B[End];';
    }

    let mermaid = 'graph TD;\n';

    steps.forEach(step => {
      const nodeShape = this.getNodeShape(step);

      if (step.type === 'decision') {
        // Decision node with yes/no branches
        if (step.yesId) {
          mermaid += `  ${step.id}${nodeShape} -->|Yes| ${step.yesId};\n`;
        }
        if (step.noId) {
          mermaid += `  ${step.id}${nodeShape} -->|No| ${step.noId};\n`;
        }
      } else if (step.nextId) {
        // Regular flow
        mermaid += `  ${step.id}${nodeShape} --> ${step.nextId};\n`;
      } else {
        // Terminal node
        mermaid += `  ${step.id}${nodeShape};\n`;
      }
    });

    return mermaid;
  }

  private static getNodeShape(step: FlowStep): string {
    const label = step.label || step.id;

    switch (step.type) {
      case 'start':
      case 'end':
        return `([${label}])`;
      case 'decision':
        return `{${label}}`;
      case 'process':
      default:
        return `[${label}]`;
    }
  }

  /**
   * Parse Mermaid string back to steps (basic implementation)
   */
  static parseMermaid(mermaid: string): FlowStep[] {
    // This is a simplified parser - you can enhance it
    const steps: FlowStep[] = [];

    // Basic parsing logic here
    // For now, return empty array as this is complex
    return steps;
  }

  /**
   * Create a default flow template
   */
  static getDefaultFlow(): FlowStep[] {
    return [
      { id: 'A', label: 'Start', type: 'start', nextId: 'B' },
      { id: 'B', label: 'Check Condition', type: 'decision', yesId: 'C', noId: 'D' },
      { id: 'C', label: 'Action if Yes', type: 'process', nextId: 'E' },
      { id: 'D', label: 'Action if No', type: 'process', nextId: 'E' },
      { id: 'E', label: 'End', type: 'end' }
    ];
  }
}
