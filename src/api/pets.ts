import api from './axios';
import type {
  ClinicDto,
  EditCodeResponse,
  ImportPetRequest,
  OwnerDetail,
} from '../types/pet';

export async function importPet(body: ImportPetRequest) {
  await api.post('/api/pets/import', body);
}
1;
///// Future Implementation
export async function getOwnerDetail(petId: number) {
  const { data } = await api.get<OwnerDetail>(`/api/pets/${petId}/owner`);
  return data;
}

export async function getHomeClinicDetail(petId: number) {
  const { data } = await api.get<ClinicDto>(`/api/pets/${petId}/home-clinic`);
  return data;
}

export async function getEditCode(petId: number) {
  const { data } = await api.get<EditCodeResponse>(
    `/api/pets/${petId}/edit-code`,
  );
  return data;
}
