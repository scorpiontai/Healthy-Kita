import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    constructor(@Inject("RedisClient") private readonly redis: Redis) { }

    async onModuleInit() {

    }

    async setWithTTL(name: string, value: any, ttl: number): Promise<any> {
        try {
            await this.redis.set(name, value, 'EX', ttl)
        } catch (err) {
            console.error(err.message);
        }
    }

    async set(name: string, value: any): Promise<any> {
        try {
            await this.redis.set(name, value)
        } catch (err) {
            console.error(err.message);
        }
    }
    async get(name: string): Promise<any> {
        try {
            const redis = await this.redis.get(name)
            return redis
        } catch (err) {
            console.error(err.message);
        }
    }
}
