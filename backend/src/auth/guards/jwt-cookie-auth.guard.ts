import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AUTH_COOKIE_NAME } from '../auth.constants';
import { AuthUser } from '../types/auth-user.type';

@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    try {
      const payload = this.jwtService.verify<AuthUser>(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
