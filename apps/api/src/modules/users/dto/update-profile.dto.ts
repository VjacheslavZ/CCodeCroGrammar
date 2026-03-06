import { ApiPropertyOptional } from '@nestjs/swagger';
import { NativeLanguage } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: NativeLanguage })
  @IsOptional()
  @IsEnum(NativeLanguage)
  nativeLanguage?: NativeLanguage;
}
