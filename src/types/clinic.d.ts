export interface CreateClinicDto {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  email?: string;
}
export interface ClinicDto extends CreateClinicDto {
  id: number;
}
