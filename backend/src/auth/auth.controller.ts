import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthCookieService } from './auth-cookie.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleUserProfile } from './decorators/google-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtCookieAuthGuard } from './guards/jwt-cookie-auth.guard';
import { AuthService } from './auth.service';
import { AuthUser, GoogleUser } from './types/auth-user.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.register(body);
    this.authCookieService.setAuthCookie(response, user);

    return { user };
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.login(body);
    this.authCookieService.setAuthCookie(response, user);

    return { user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    this.authCookieService.clearAuthCookie(response);

    return { message: 'Logged out' };
  }

  @Get('me')
  @UseGuards(JwtCookieAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @GoogleUserProfile() googleUser: GoogleUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const user = await this.authService.validateGoogleUser(googleUser);

    this.authCookieService.setAuthCookie(response, user);

    return { user };
  }
}
