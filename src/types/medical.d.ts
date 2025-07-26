export interface AppointmentSummaryDto {
  id: number;
  date: string; // ISO-8601 UTC
  weight: number;
  temperature: number;
  heartRate: number;
  description?: string;
  treatments?: string;
  diagnosis?: string;
  notes?: string;
  createdById: number;
  symptoms: string[];
  /* NUEVO */
  clinicId?: number;
  clinicName?: string;
}

export interface AppointmentDetailDto {
  id: number;
  date: string;
  weight: number;
  temperature: number;
  heartRate: number;
  description?: string;
  treatments?: string;
  diagnosis?: string;
  notes?: string;
  createdById: number;
  symptoms: string[];

  /* opcional: si añadiste clinicName en el backend */
  clinicName?: string;
}

export interface HistoricalRecordDto {
  recordId: number;
  clinics: { id?: number; name: string; address?: string }[]; // adaptado
  //   clinic?: { name: string; address?: string };
  appointments: AppointmentSummaryDto[];
}

export interface CreateAppointmentRequest {
  date?: string; // opcional, ahora mismo puede ser null
  weight: number;
  temperature: number;
  heartRate?: number;
  description?: string;
  treatments?: string;
  diagnosis?: string;
  notes?: string;
  symptoms?: string[];
}
