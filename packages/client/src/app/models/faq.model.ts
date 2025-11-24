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
}
