import { randomBytes, createHash } from 'crypto';

import { REFRESH_TOKEN_EXPIRY_DAYS } from '@cro/shared';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly users: UsersService,
  ) {}

  async validateOAuthLogin(profile: OAuthProfile) {
    const user = await this.users.findOrCreateByOAuth(profile);
    return this.generateTokens(user.id, user.email, user.role);
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
