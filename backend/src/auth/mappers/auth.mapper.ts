import { User } from '@prisma/client';
import { AuthenticatedUserResponseDto } from '../dto/auth-response.dto';

export class AuthMapper {
  static toAuthenticatedUser(user: User): AuthenticatedUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
