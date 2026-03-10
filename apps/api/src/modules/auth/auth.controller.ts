import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { GoogleTokenDto } from './dto/google-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request) {
    return req.user;
  }

  /** Mobile/Web: exchange Google auth code or verify ID token */
  @Post('google/token')
  async googleToken(@Body() dto: GoogleTokenDto) {
    if (dto.code && dto.redirectUri) {
      return this.auth.exchangeGoogleCode(dto.code, dto.redirectUri);
    }
    if (dto.idToken) {
      return this.auth.verifyGoogleIdToken(dto.idToken);
    }
    return { message: 'Provide either idToken or code + redirectUri' };
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    await this.auth.logout(dto.refreshToken);
    return { message: 'Logged out' };
  }
}
