import api from './axios';
import type {
  RegisterVetRequest,
  RegisterVetWithFaceRequest,
} from '../types/vet';

export async function registerVet(body: RegisterVetRequest) {
  await api.post('/api/auth/register/vet', body);
}

// ✅ NEW: registration with Keycloak + DeepFace
export async function registerVetWithFace(body: RegisterVetWithFaceRequest) {
  await api.post('/api/auth/vet-with-face', body);
}
