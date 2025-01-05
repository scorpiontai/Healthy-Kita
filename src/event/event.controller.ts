import { Controller } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Payload } from '@nestjs/microservices';
import { UseAsk } from './DTO/useAsk.dto.';
import { CalculationEvent } from 'src/submitted-handler/DTO/calculation-event.dto';
import { RedisService } from 'src/redis/redis.service';
import { OnEvent } from '@nestjs/event-emitter';
import { startAuditEvent } from 'src/ask/micro-audit-event/start/start-audit.event.dto';

@Controller()
export class EventController {
    constructor(
        private readonly eventBus: EventBus,
        private readonly redisServ: RedisService,
    ) { }
    @OnEvent("useAsk")
    async receiver(@Payload() messages: UseAsk): Promise<any> {
        try {
            const { userIDEnc, timestamp, fullName,
                tall, age, weight, intensActivity }: any = messages

            await this.eventBus.publish(
                new startAuditEvent(
                    userIDEnc,
                    timestamp,
                    fullName,
                    tall,
                    age,
                    weight,
                    intensActivity
                ))

        } catch (err) {
            console.error(err.message);
        }
    }

    @OnEvent("submitted")
    async submittedAnswer(@Payload() message: any): Promise<any> {
        try {
            const { userIDEnc, range } = message

            await this.redisServ.lock(`answer:${userIDEnc}`, {
                userID: userIDEnc,
                content: JSON.stringify(range)
            })

            await this.eventBus.publish(
                new CalculationEvent(userIDEnc
                ))

        } catch (err) {
            console.error(err.message);
        }
    }
}
