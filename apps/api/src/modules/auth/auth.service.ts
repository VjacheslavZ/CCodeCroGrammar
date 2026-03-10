import { randomBytes, createHash } from 'crypto';

import { REFRESH_TOKEN_EXPIRY_DAYS } from '@cro/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';

import { RedisService } from '../../common/redis/redis.service';
import { UsersService } from '../users/users.service';

interface OAuthProfile {
  provider: 'google' | 'apple';
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.config.get('GOOGLE_CLIENT_ID'),
      this.config.get('GOOGLE_CLIENT_SECRET'),
    );
  }

  async validateOAuthLogin(profile: OAuthProfile) {
    const user = await this.users.findOrCreateByOAuth(profile);
    return this.generateTokens(user.id, user.email, user.role);
  }

  /** Verify a Google ID token from a mobile client and return auth tokens + user */
  async verifyGoogleIdToken(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.get('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const user = await this.users.findOrCreateByOAuth({
      provider: 'google',
      providerId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email,
      avatarUrl: payload.picture,
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        nativeLanguage: user.nativeLanguage,
        xpTotal: user.xpTotal,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      tokens,
    };
  }

  /** Exchange a Google authorization code for user info and return auth tokens + user */
  async exchangeGoogleCode(code: string, redirectUri: string) {
    const { tokens } = await this.googleClient.getToken({ code, redirect_uri: redirectUri });
    const idToken = tokens.id_token;
    if (!idToken) {
      throw new UnauthorizedException('Failed to get ID token from Google');
    }
    return this.verifyGoogleIdToken(idToken);
  }

  async refreshTokens(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    const userId = await this.redis.get(`refresh:${hash}`);
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate: delete old token
    await this.redis.del(`refresh:${hash}`);

    const user = await this.users.findById(userId);
    if (!user || user.isBlocked) {
      throw new UnauthorizedException('User not found or blocked');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  async logout(refreshToken: string) {
    const hash = this.hashToken(refreshToken);
    await this.redis.del(`refresh:${hash}`);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload);
    const refreshToken = randomBytes(64).toString('hex');

    const hash = this.hashToken(refreshToken);
    const ttl = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60;
    await this.redis.set(`refresh:${hash}`, userId, 'EX', ttl);

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
