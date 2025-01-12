import { Controller, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UseAsk } from './DTO/useAsk.dto.';
import { CalculationEvent } from 'src/submitted-handler/DTO/calculation-event.dto';
import { RedisService } from 'src/redis/redis.service';
import { OnEvent } from '@nestjs/event-emitter';
import { startAuditEvent } from 'src/ask/micro-audit-event/start/start-audit.event.dto';
import { NotificationsEvent } from 'src/notifications/notifications.event.dto';
import { VoteHandling } from 'src/votte/DTO/vote.service.dto';

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

            await this.redisServ.lock(`answer`, {
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
    @EventPattern("notifications")
    async sendNotifications(@Payload() payload: any): Promise<any> {
        try {
            const { userID, message } = payload
            Logger.debug("user id is", userID, message)
            /*
            await this.eventBus.publish(
                new NotificationsEvent(
                    userID, message,
                    new Date().toLocaleDateString()
                )
            )
                */
        } catch (err) {
            console.error(err.message);
        }
    }

    @EventPattern("VoteHandling")
    async voteHandling(@Payload() payload: any): Promise<any> {
        try {
            const { key } = payload
            await this.eventBus.publish(
                new VoteHandling(key)
            )
        } catch (err) {
            console.error(err.message);
        }
    }
}
