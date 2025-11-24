export interface FormField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'flow-builder';
    required?: boolean;
    options?: { label: string; value: unknown }[];
    rows?: number;
    description?: string;
    placeholder?: string;
}
