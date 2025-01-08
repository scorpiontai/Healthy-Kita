import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class RedisService {

    constructor(@Inject("RedisClient") private readonly redis: Redis
    ) {

    }
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async setWithTTL(name: string, value: any, ttl: number): Promise<any> {
        try {
            await this.redis.set(name, value, 'EX', ttl)
            return true
        } catch (err) {
            console.error(err.message);
        }
    }

    async setHsetwithTTL(name: string, value: any, ttl: number): Promise<any> {
        try {
            await this.redis.hset(name, value, 'EX', ttl)
            return true
        } catch (err) {
            console.error(err.message);
        }
    }


    async setHset(name: string, value: any,): Promise<any> {
        try {
            await this.redis.hset(name, value)
            return true
        } catch (err) {
            console.error(err.message);
        }
    }

    async set(name: string, value: any): Promise<any> {
        try {
            await this.redis.set(name, value)
            return true
        } catch (err) {
            console.error(err.message);
        }
    }
    async get(name: string): Promise<any> {
        try {
            const redis: any = await this.redis.get(name)
            return redis
        } catch (err) {
            console.error(err.message);
        }
    }

    async del(name: string): Promise<any> {
        try {
            await this.redis.del(name)
            return true
        } catch (err) {
            console.error(err.message);
        }
    }


    async lock(name: string, value: any): Promise<any> {
        try {
            const { content } = value
            this.redis.setnx(name, JSON.stringify(content))
            this.redis.expire(name, 80)
            return true
        } catch (err) {
            console.error(err.message);
        }
    }

    async lockForPublish(name: string, value: any): Promise<any> {
        try {
            const { content } = value
            this.redis.setnx(name, JSON.stringify(content))
            return true
        } catch (err) {
            console.error(err.message);
        }
    }

    async unlocked(name: string): Promise<any> {
        try {
            const value = await this.redis.get(name)
            return JSON.parse(value)
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }

    async unlockedForPublish(name: string): Promise<any> {
        try {
            return await this.redis.del(name)
        } catch (err) {
            console.error(err.message);
            throw err;
        }
    }



    async unlock(name: string): Promise<any> {
        try {
            return JSON.parse(await this.redis.get(name))
        } catch (err) {
            console.error(err.message);
        }
    }

    async lockForAccses(email: string, token: string): Promise<any> {
        try {
            await this.redis.setnx(`token:${email}`, token)
            await this.redis.expire(`token:${email}`, 3500)
            return true
        } catch (err) {
            console.error(err.message);
        }
    }
}
