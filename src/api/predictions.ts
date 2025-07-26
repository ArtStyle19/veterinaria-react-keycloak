// src/api/predictions.ts
import api from './axios';

export interface PredictionRequest {
  symptoms: string[];
}
export interface PredictionResponse {
  disease: string;
  precautions: Record<string, string>; // { precaution0: "...", … }
}

export async function predict(body: PredictionRequest) {
  const { data } = await api.post<PredictionResponse>('/api/predictions', body);
  return data;
}
