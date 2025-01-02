import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
@Injectable()
export class RedisService {

    constructor(@Inject("RedisClient") private readonly redis: Redis,
    ) {

    }

    async setWithTTL(name: string, value: any, ttl: number): Promise<any> {
        try {
            await this.redis.set(name, value, 'EX', ttl)
            Logger.debug("set with ttl")
        } catch (err) {
            console.error(err.message);
        }
    }

    async setHsetwithTTL(name: string, value: any, ttl: number): Promise<any> {
        try {
            await this.redis.hset(name, value, 'EX', ttl)
            Logger.debug("set with hset ttl")
        } catch (err) {
            console.error(err.message);
        }
    }


    async setHset(name: string, value: any,): Promise<any> {
        try {
            await this.redis.hset(name, value)
            Logger.debug("set with redis hset ttl")
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
            const redis: any = await this.redis.get(name)
            return redis
        } catch (err) {
            console.error(err.message);
        }
    }

    async del(name: string): Promise<any> {
        try {
            await this.redis.del(name)
        } catch (err) {
            console.error(err.message);
        }
    }


    async lock(name: string, value: any): Promise<any> {
        try {
            let { userID, content } = value
            let named = name.split(":")

            if (named[1] === userID) {
                await this.redis.set(name, JSON.stringify(content), 'NX')
                Logger.debug("set lock")
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    async unlock(name: string): Promise<any> {
        try {
            setTimeout(async () => {
                await this.redis.del(name)
            }, 5000);

            return await this.redis.get(name)
        } catch (err) {
            console.error(err.message);
        }
    }

}
