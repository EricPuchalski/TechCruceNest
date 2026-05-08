import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GoogleUser } from '../types/auth-user.type';

export const GoogleUserProfile = createParamDecorator(
  (_data: unknown, context: ExecutionContext): GoogleUser => {
    const request = context.switchToHttp().getRequest();
    return request.user as GoogleUser;
  },
);
