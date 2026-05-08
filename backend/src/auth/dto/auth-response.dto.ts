export interface AuthenticatedUserResponseDto {
  id: string;
  name: string | null;
  email: string;
  provider: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseDto {
  user: AuthenticatedUserResponseDto;
}
