import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from './auth.constants';
import { AuthenticatedUserResponseDto } from './dto/auth-response.dto';
import { AuthUser } from './types/auth-user.type';

@Injectable()
export class AuthCookieService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  setAuthCookie(response: Response, user: AuthenticatedUserResponseDto): void {
    const token = this.jwtService.sign(this.buildAuthPayload(user));

    response.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction(),
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
  }

  clearAuthCookie(response: Response): void {
    response.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction(),
      path: '/',
    });
  }

  private buildAuthPayload(user: AuthenticatedUserResponseDto): AuthUser {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }
}
