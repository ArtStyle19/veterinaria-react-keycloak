export interface JwtResponse {
  token: string;
  expiresAt: string; // ISO-8601
}

export interface UserDto {
  id: number;
  username: string;
  roleName: 'ADMIN' | 'VET' | 'PET_OWNER';
}
