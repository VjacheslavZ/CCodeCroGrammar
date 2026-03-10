import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GoogleTokenDto {
  @ApiProperty({ description: 'Google ID token (web flow)', required: false })
  @IsString()
  @IsOptional()
  idToken?: string;

  @ApiProperty({ description: 'Google authorization code (mobile flow)', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: 'Redirect URI used in the auth request (required with code)',
    required: false,
  })
  @IsString()
  @IsOptional()
  redirectUri?: string;
}
