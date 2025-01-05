import { Logger, Module } from '@nestjs/common';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('./src/.env') });

@Module({
  providers: [
    {
      provide: 'RedisClient', 
      useFactory: () => {
        const redisInstance = new Redis({
          host: process.env.REDIS_HOST,
          port: +process.env.REDIS_PORT,
        });

        redisInstance.on('error', (e) => {
          Logger.error(`Redis publish connection failed: ${e}`);
        });

        return redisInstance;
      },
    },
    {
      provide: 'RedisSub', 
      useFactory: () => {
        const redisInstance = new Redis({
          host: process.env.REDIS_HOST,
          port: +process.env.REDIS_PORT,
        });

        redisInstance.on('error', (e) => {
          Logger.error(`Redis subscribe connection failed: ${e}`);
        });

        return redisInstance;
      },
    },
  ],
  exports: ['RedisClient', 'RedisSub'],
})
export class RedisModule {}
