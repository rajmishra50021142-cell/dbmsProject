import { apiClient, downloadBlob } from './apiClient';
import {
  ExcelInspectResponse,
  ExcelSuggestResponse,
  ValidateRowsRequest,
  RowValidationResponse,
  ExcelExportRequest,
} from '../types/excel';

export const excelService = {
  /**
   * Upload an Excel workbook (.xlsx) and inspect its sheets, headers, sample rows, and issues.
   */
  async inspectWorkbook(
    file: File,
    sheetName?: string,
    headerRowIndex: number = 0
  ): Promise<ExcelInspectResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (sheetName) {
      formData.append('sheet_name', sheetName);
    }
    formData.append('header_row_index', headerRowIndex.toString());

    return apiClient.postFormData<ExcelInspectResponse>('/excel/inspect', formData);
  },

  /**
   * Suggest candidate keys, functional dependencies, and non-atomic review flags
   * from inspected table rows.
   */
  async suggestSchemaAndDependencies(
    columns: string[],
    rows: Record<string, any>[]
  ): Promise<ExcelSuggestResponse> {
    return apiClient.post<ExcelSuggestResponse>('/excel/suggest', {
      columns,
      rows,
    });
  },

  /**
   * Validate uploaded rows against user-defined functional dependencies.
   * Identifies exact row pairs that contradict determinants.
   */
  async validateRows(req: ValidateRowsRequest): Promise<RowValidationResponse> {
    return apiClient.post<RowValidationResponse>('/excel/validate-rows', req);
  },

  /**
   * Export normalized workbook (.xlsx) decomposed by the DBMS normalization engine.
   */
  async exportNormalizedWorkbook(req: ExcelExportRequest): Promise<Blob> {
    return downloadBlob('/excel/export-normalized', req);
  },

  /**
   * Helper to trigger a browser file download of a Blob.
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
