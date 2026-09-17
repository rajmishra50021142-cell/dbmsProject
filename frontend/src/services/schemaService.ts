import { apiClient } from './apiClient';
import type { RelationSchema, ValidationResult, ExampleSchemaItem } from '../types';

export interface RawParseRequest {
  raw_text: string;
}

export const schemaService = {
  /**
   * Authoritative backend validation of a canonical schema definition.
   */
  validateSchema: async (schema: RelationSchema): Promise<ValidationResult> => {
    return await apiClient.post<ValidationResult>('/schema/validate', schema);
  },

  /**
   * Parse raw mathematical DBMS notation into canonical schema structure.
   */
  parseRawSchema: async (raw_text: string): Promise<ValidationResult> => {
    return await apiClient.post<ValidationResult>('/schema/parse-raw', { raw_text });
  },

  /**
   * Fetch textbook reference examples from the backend.
   */
  fetchExamples: async (): Promise<ExampleSchemaItem[]> => {
    return await apiClient.get<ExampleSchemaItem[]>('/schema/examples');
  },
};
