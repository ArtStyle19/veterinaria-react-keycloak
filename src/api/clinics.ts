import api from './axios';
import type { ClinicDto, CreateClinicDto } from '../types/clinic';

export async function getAllClinics() {
  const { data } = await api.get<ClinicDto[]>('/api/clinics');
  return data;
}

export async function createClinic(dto: CreateClinicDto) {
  const { data } = await api.post<ClinicDto>('/api/clinics', dto);
  return data;
}

export async function getVetClinic(): Promise<ClinicDto> {
  // Axios automatically adds the Bearer token via the interceptor
  const { data } = await api.get<ClinicDto>('/api/clinics/me');
  return data;
}

import axios from 'axios';

export interface ClinicStatsDto {
  incomeThisMonth: number;
  totalAppointments: number;
  lostPets: number;
  dailyAppointments: { day: string; count: number }[];
  monthlyAppointments: { month: string; income: number }[];
  topSymptoms: { symptom: string; count: number }[];
}

export async function getClinicStats(
  clinicId: number,
  from: string, // yyyy-MM-dd
  to: string,
): Promise<ClinicStatsDto> {
  const response = await axios.get(`/admin/clinics/${clinicId}/stats`, {
    params: { from, to },
  });
  return response.data;
}

export function last30Days(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 30);

  return {
    from: from.toISOString().split('T')[0], // yyyy-MM-dd
    to: to.toISOString().split('T')[0],
  };
}
