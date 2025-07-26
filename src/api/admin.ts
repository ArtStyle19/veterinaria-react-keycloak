// src/api/admin.ts
import api from './axios'; // interceptor con JWT

import type { ClinicStatsDto, GlobalStatsDto } from '../types/stats';

export const getClinicStats = (clinicId: number, from?: string, to?: string) =>
  api.get<ClinicStatsDto>(`/admin/clinics/${clinicId}/stats`, {
    params: { from, to },
  });

export const getGlobalStats = (from?: string, to?: string) =>
  api.get<GlobalStatsDto>('/admin/stats', { params: { from, to } });
