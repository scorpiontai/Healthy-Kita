import { FactoryProvider } from '@nestjs/common';
import { Redis } from 'ioredis';
import { resolve } from 'path'
import * as dotenv from 'dotenv';
dotenv.config({ path: resolve('./src/.env') });

export const redisClientFactory: FactoryProvider<Redis> = {
    provide: 'RedisClient',
    useFactory: () => {
        const redisInstance = new Redis({
            host: process.env.REDIS_HOST,
            port: +process.env.REDIS_PORT,
        });

        redisInstance.on('error', e => {
            throw new Error(`Redis connection failed: ${e}`);
        });

        return redisInstance;
    },
    inject: [],
};