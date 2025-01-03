import { Controller, Logger } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { Payload } from '@nestjs/microservices';
import { UseAsk } from './DTO/useAsk.dto.';
import { AuditEvent } from 'src/ask/audir-event.dto';
import { CalculationEvent } from 'src/submitted-handler/DTO/calculation-event.dto';
import { RedisService } from 'src/redis/redis.service';
import { OnEvent } from '@nestjs/event-emitter';
import { SystemGateway } from 'src/system/system.gateway';

@Controller()
export class EventController {
    constructor(
        private readonly eventBus: EventBus,
        private readonly redisServ: RedisService,
        private readonly systemGatewaySocket: SystemGateway
    ) { }
    @OnEvent("useAsk") // for AI chat bot
    async receiver(@Payload() messages: UseAsk): Promise<any> {
        try {
            //keyEnc and ivEnch get from emitter
            const { userID, timestamp,
                encKey, ivKey }: any = messages
            //this action to publish event 
            await this.eventBus.publish(new AuditEvent(
                userID,
                timestamp,
                encKey,
                ivKey
            ))



        } catch (err) {
            console.error(err.message);
        }
    }

    @OnEvent("notifications")
    async notifPattern(@Payload() message: any): Promise<any> {
        try {
            const { userID, messages, timestamp } = message
            //    await this.eventBus.publish(new notifEvent(userID, messages, timestamp, keyEnc, ivEnc))
            Logger.debug(message)
        } catch (err) {
            console.error(err.message);
        }
    }

    @OnEvent("submitted")
    async submittedAnswer(@Payload() message: any): Promise<any> {
        try {
            const { userIDEnc, encKey, ivKey } = message

            console.debug("user id enc is", userIDEnc, encKey, ivKey)
            await this.eventBus.publish(
                new CalculationEvent(userIDEnc,
                    encKey, ivKey
                ))
        } catch (err) {
            console.error(err.message);
        }
    }

    @OnEvent("result_socket")
    async result_socket(@Payload() message: any): Promise<any> {
        const { userID, encKey, ivKey } = message
        try {
            await this.redisServ.unlock(`result_socket:${userID}`)

            this.systemGatewaySocket.responseResult({
                client:
                    userID, encKey: encKey, ivKey: ivKey
            })

        } catch (err) {
            console.error(err.message);
        }
    }

    @OnEvent("question_socket")
    async question_socket(@Payload() message: any): Promise<any> {
        const { userID, encKey,
            ivKey, userIDEnc, messages} = message
        try {
            await this.redisServ.unlock(`qusetion_socket:${userIDEnc}`)

            this.systemGatewaySocket.responseQuestion(
                {
                    client: userIDEnc,
                    encKey: encKey,
                    ivKey: ivKey,
                    message: messages
                }
            )
        } catch (err) {
            console.error(err.message);
        }
    }
}
