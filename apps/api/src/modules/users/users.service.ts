import { Injectable } from '@nestjs/common';
import { NativeLanguage, User } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

interface OAuthProfile {
  provider: 'google' | 'apple';
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findOrCreateByOAuth(profile: OAuthProfile): Promise<User> {
    const existing =
      profile.provider === 'google'
        ? await this.prisma.user.findUnique({ where: { googleId: profile.providerId } })
        : await this.prisma.user.findUnique({ where: { appleId: profile.providerId } });

    if (existing) return existing;

    // Check if a user with this email already exists (link accounts)
    const byEmail = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    const providerData =
      profile.provider === 'google'
        ? { googleId: profile.providerId }
        : { appleId: profile.providerId };

    if (byEmail) {
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: providerData,
      });
    }

    return this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl ?? null,
        ...providerData,
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; nativeLanguage?: NativeLanguage },
  ): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async updatePushToken(userId: string, token: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: token },
    });
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
