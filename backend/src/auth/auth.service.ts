import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthProvider } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthenticatedUserResponseDto } from './dto/auth-response.dto';
import { AuthMapper } from './mappers/auth.mapper';
import { GoogleUser } from './types/auth-user.type';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: RegisterDto): Promise<AuthenticatedUserResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name?.trim() || null,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        provider: AuthProvider.local,
      },
    });

    return AuthMapper.toAuthenticatedUser(user);
  }

  async login(data: LoginDto): Promise<AuthenticatedUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await compare(data.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return AuthMapper.toAuthenticatedUser(user);
  }

  async validateGoogleUser(
    profile: GoogleUser,
  ): Promise<AuthenticatedUserResponseDto> {
    if (!profile.email) {
      throw new UnauthorizedException('Google account email is required');
    }

    const normalizedEmail = profile.email.toLowerCase();

    const existingByGoogleId = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (existingByGoogleId) {
      return AuthMapper.toAuthenticatedUser(existingByGoogleId);
    }

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingByEmail) {
      const updatedUser = await this.prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          googleId: profile.googleId,
          provider: AuthProvider.google,
          name: existingByEmail.name ?? profile.name ?? null,
        },
      });

      return AuthMapper.toAuthenticatedUser(updatedUser);
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: profile.name ?? null,
        googleId: profile.googleId,
        provider: AuthProvider.google,
      },
    });

    return AuthMapper.toAuthenticatedUser(user);
  }
}
