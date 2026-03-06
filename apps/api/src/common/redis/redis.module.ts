import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: RedisService,
      useFactory: (config: ConfigService) => {
        return new RedisService(config.get<string>('REDIS_URL')!);
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
