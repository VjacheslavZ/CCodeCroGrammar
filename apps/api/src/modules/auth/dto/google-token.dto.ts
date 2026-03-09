import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleTokenDto {
  @ApiProperty({ description: 'Google ID token from mobile client' })
  @IsString()
  idToken!: string;
}
