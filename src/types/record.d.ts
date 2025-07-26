export interface recordAccessResponse {
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
