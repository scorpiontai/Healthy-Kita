import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule'
import { RedisService } from 'src/redis/redis.service';
@Injectable()
export class TaskService {
    constructor(private readonly scheduleRegistry: SchedulerRegistry,
        private readonly redis: RedisService
    ) { }

    scheduleDeleteFiveMinutes(keyName) {
        const timeout = setTimeout(async () => {
            //this action
            await this.redis.del(keyName)
        }, 5 * 60 * 1000)
    }
}

