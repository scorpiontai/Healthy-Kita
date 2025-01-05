import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { startAuditEvent } from "./start-audit.event.dto";
import { RedisService } from "src/redis/redis.service";
import { CacheQuestionEvent } from "../cache-question-event.dto";
@EventsHandler(startAuditEvent)
export class StartAudit implements IEventHandler<startAuditEvent> {
    constructor(
        private readonly redisServ: RedisService,
        private readonly eventBus: EventBus,
    ) { }
    async handle(event: startAuditEvent): Promise<any> {
        const { userIDEnc, timeStamp, fullName, tall, age, weight, intensActivity } = event
        try {
            //check lock
            //unlock
            const metadata = {
                userIdEncs: userIDEnc,
                fullName: fullName,
                tall: tall,
                age: age,
                weight: weight,
                intensActivity: intensActivity
            }

            // lock for generate question
            await this.redisServ.lock(`generate_question`, {
                content: metadata
            })

            await this.eventBus.publish(new CacheQuestionEvent(
                userIDEnc
            ))

        } catch (error) {
            console.error(error.message)
        }
    }
}