export interface FilterField {
  type: 'text' | 'number' | 'date' | 'select';
  formControlName: string;
  label: string;
  placeholder: string;
  colSpan: number;
  options?: { label: string; value: string }[];
}
