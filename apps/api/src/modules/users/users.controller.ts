import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePushTokenDto } from './dto/update-push-token.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    return this.users.findById(user.id);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Post('me/push-token')
  async updatePushToken(@CurrentUser() user: RequestUser, @Body() dto: UpdatePushTokenDto) {
    await this.users.updatePushToken(user.id, dto.token);
    return { message: 'Push token updated' };
  }

  @Delete('me')
  async deleteMe(@CurrentUser() user: RequestUser) {
    await this.users.deleteAccount(user.id);
    return { message: 'Account deleted' };
  }
}
