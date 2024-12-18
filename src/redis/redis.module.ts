import { Logger, Module } from '@nestjs/common';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import { resolve } from 'path'
dotenv.config({ path: resolve('./src/.env') });

@Module({
    providers: [
        {
            provide: 'RedisClient',
            useFactory: () => {
                const redisInstance = new Redis({
                    host: process.env.REDIS_HOST,
                    port: +process.env.REDIS_PORT
                });

                redisInstance.on('error', (e) => {
                    Logger.error(`Redis connection failed: ${e}`);
                });

                return redisInstance;
            },
        },
    ],
})
export class RedisModule { }