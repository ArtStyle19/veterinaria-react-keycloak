import ClinicDto from './clinic';

export interface PetListItemDto {
  id: number;
  name: string;
  species: string;
  breed?: string;
  status: 'LOST' | 'OK' | 'SICK' | 'DECEASED';
  birthdate?: string; // ISO string
  /* sent only to VET users */
  ownerName?: string;
  accessLevel?: 'READ_ONLY' | 'WRITE' | 'FULL';
  /* sent only to PET_OWNER users */
  homeClinic?: string;
}
// types/pet.ts
// export interface PetListItemDto {
//   id: number;
//   name: string;
//   species: string;
//   breed?: string;
//   status: 'OK' | 'LOST' | 'SICK' | 'DECEASED';
//   birthdate?: string; // ISO string
//   /* sent only to VET users */
//   ownerName?: string;
//   accessLevel?: 'READ_ONLY' | 'WRITE' | 'FULL';
//   /* sent only to PET_OWNER users */
//   homeClinic?: string;
// }

export interface ImportPetRequest {
  qrCodeToken: uuid;
  editCode: string;
}
export interface PetCreation {
  name: string;
  species: string;
  breed?: string;
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN';
  status: 'OK' | 'LOST' | 'SICK' | 'DECEASED';
  birthdate: Date;
  clinic?: number;
  ownerName?: string;
  ownerContact?: string;
  ownerEmail?: string;
  visibility?: 'PUBLIC_ONLY' | 'PRIVATE' | 'PUBLIC';
}

export interface PetDto extends PetListItemDto {
  qrCodeToken: unknown;
  visibility: ReactNode;
  clinic?: number;

  // sex?: string;
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN'; // <--- Make it non-optional and specific literals
  birthdate: Date;
  ownerName?: string;
  ownerContact?: string;
  ownerEmail?: string;
  canBeImported?: boolean; // NO OWNER
}

export interface PublicPetDto extends PetListItemDto {
  qrCodeToken: unknown;
  visibility: ReactNode;
  clinic?: ClinicDto;
  accessLevelEnum: 'FULL' | 'WRITE' | 'NONE' | 'FULL_OWNER';

  // sex?: string;
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN'; // <--- Make it non-optional and specific literals
  birthdate: Date;
  ownerName?: string;
  ownerContact?: string;
  ownerEmail?: string;
  canBeImported?: boolean;
}

// Extended Info

export interface OwnerDetail {
  id: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface ClinicDto {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  email: string;
}

export interface EditCodeResponse {
  edit_code: number;
}
