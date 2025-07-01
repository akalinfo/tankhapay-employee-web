// models/filter.model.ts
export interface FilterField {
    key: string;           // Unique identifier for the filter
    label: string;         // Label to display
    type: 'text' | 'select' | 'date' | 'range' | 'radio' | 'checkbox'; // Type of filter
    options?: { label: string; value: any; id?: string }[];  // For dropdowns, radio and checkbox
    placeholder?: string;  // Placeholder for text inputs
  }
  