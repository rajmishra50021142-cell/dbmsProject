import { FunctionalDependency, MultivaluedDependency } from './index';

export interface ExcelIssue {
  severity: 'info' | 'warning' | 'error';
  category: 'header' | 'atomic' | 'missing' | 'duplicate' | 'type';
  message: string;
  row?: number;
  column?: string;
}

export interface ExcelInspectResponse {
  filename: string;
  sheet_names: string[];
  selected_sheet: string;
  header_row_index: number;
  columns: string[];
  total_rows: number;
  preview_rows: Record<string, any>[];
  issues: ExcelIssue[];
  has_non_atomic_values: boolean;
}

export interface ObservedKey {
  attributes: string[];
  is_unique: boolean;
  uniqueness_ratio: number;
  null_count: number;
  confidence: 'High' | 'Moderate' | 'Weak';
}

export interface ObservedFD {
  id?: string;
  determinant: string[];
  dependent: string[];
  notation: string;
  holds: boolean;
  violation_count: number;
  confidence: 'Strong' | 'Empirical' | 'Weak';
  notes: string;
}

export interface AtomicityReviewItem {
  attribute: string;
  sample_value: string;
  delimiter_detected: string;
  reason: string;
  suggested_action: string;
}

export interface ExcelSuggestResponse {
  relation_name: string;
  candidate_keys: ObservedKey[];
  functional_dependencies: ObservedFD[];
  atomicity_reviews: AtomicityReviewItem[];
  sample_row_count: number;
  disclaimer: string;
}

export interface ColumnMapping {
  schemaAttribute: string;
  excelColumn: string;
}

export interface ValidateRowsRequest {
  columns: string[];
  rows: Record<string, any>[];
  functional_dependencies: FunctionalDependency[];
  column_mapping?: Record<string, string>;
}

export interface RowValidationResponse {
  valid: boolean;
  total_rows: number;
  violations_count: number;
  issues: ExcelIssue[];
}

export interface ExcelExportRequest {
  relation_name: string;
  attributes: string[];
  functional_dependencies: FunctionalDependency[];
  multivalued_dependencies?: MultivaluedDependency[];
  candidate_keys?: string[][];
  target_normal_form?: string;
  rows: Record<string, any>[];
  column_mapping?: Record<string, string>;
}
