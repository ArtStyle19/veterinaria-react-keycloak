export interface RegisterVetRequest {
  username: string;
  password: string;
  clinicId: number;
  celNum?: string;
  email?: string;
}

export interface RegisterVetWithFaceRequest {
  username: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  clinicId: string; // UUID as string
  celNum: string;
  faceBase64: string;
}
