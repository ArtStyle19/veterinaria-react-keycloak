/* types/stats.d.ts */
export interface DailyCount {
  day: string;
  count: number;
}
export interface MonthlyCount {
  month: string;
  count: number;
}
export interface SymptomCount {
  symptom: string;
  occurrences: number;
}

export interface ClinicStatsDto {
  dailyAppointments: DailyCount[];
  monthlyAppointments: MonthlyCount[];
  totalAppointments: number;
  totalIncome: string; // viene como String (BigDecimal)
  incomeThisMonth: string;
  uniquePatients: number;
  activeVets: number;
  lostDogs: number;
  topSymptoms: SymptomCount[];
}

export interface TopClinicDto {
  clinicId: number;
  clinicName: string;
  totalAppointments: number;
  totalIncome: string;
}

export interface GlobalStatsDto {
  dailyAppointments: DailyCount[];
  monthlyAppointments: MonthlyCount[];
  totalAppointments: number;
  totalIncome: string;
  incomeThisMonth: string;
  totalClinics: number;
  totalLostDogs: number;
  topSymptoms: SymptomCount[];
  topClinics: TopClinicDto[];
}
