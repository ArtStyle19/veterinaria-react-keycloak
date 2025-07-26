import api from './axios';
import type { recordAccessResponse } from '../types/record';

export async function getRecordsClinicAccess(recordId: number) {
  const { data } = await api.get<recordAccessResponse[]>(
    `/api/records/access/${recordId}`,
  );
  return data;
}

export interface UpdateAccessLevelBody {
  clinicId: number;
  accessLevel: 'NONE' | 'READ' | 'WRITE' | 'FULL'; // adáptalo a tu enum
}

/**
 * Cambia el nivel de acceso de UNA clínica a un registro.
 */
export async function updateRecordClinicAccess(
  recordId: number,
  body: UpdateAccessLevelBody,
) {
  await api.patch(`/api/records/access/${recordId}`, body);
}
