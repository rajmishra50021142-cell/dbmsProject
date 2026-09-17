/**
 * Service for communicating with the Normalization Assistant API.
 */

import { request } from './apiClient';
import { AssistantAskRequest, AssistantAskResponse } from '../types';

export async function askAssistant(payload: AssistantAskRequest): Promise<AssistantAskResponse> {
  return request<AssistantAskResponse>('/assistant/ask', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export const assistantService = {
  askAssistant,
};
