export interface TableColumns {
  field: string;
  header: string;
  width?: string;
  showDropdown?: boolean;
  dropdownConfig?: Array<{ text: string; value: string }>;
}
