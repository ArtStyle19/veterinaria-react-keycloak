import api from './axios';

import type { AppointmentDetailDto } from '../types/medical';

import type {
  HistoricalRecordDto,
  AppointmentSummaryDto,
  CreateAppointmentRequest,
} from '../types/medical';

export async function getPetHistory(petId: number) {
  const { data } = await api.get<HistoricalRecordDto[]>(
    `/api/records/by-pet/${petId}`,
  );
  return data;
}

export async function getSymptoms() {
  const { data } = await api.get<string[]>('/api/symptoms');
  return data;
}

export async function createAppointment(
  recordId: number,
  body: CreateAppointmentRequest,
) {
  await api.post(`/api/appointment/${recordId}/create`, body);
}

// export async function getAppointmentsByRecord(recordId: number) {
//   const { data } = await api.get<AppointmentSummaryDto[]>(
//     `/api/appointment/${recordId}`,
//   );
//   return data;
// }

export async function getAppointmentDetail(id: number) {
  const { data } = await api.get<AppointmentDetailDto>(
    `/api/appointment/${id}`,
  );
  return data;
}
