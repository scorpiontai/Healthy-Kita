import { EventBus, EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CacheQuestionEvent } from "./cache-question-event.dto";
import { GeminiService } from "src/gemini/gemini.service";
import { CouchbBaseService } from "src/couchbase/couchbase.service";
import { AischemaService } from "src/mongoose/aischema/aischema.service";
import { Logger } from "@nestjs/common";
import { StartAudit } from "./start/StartAudit.event";
import { startAuditEvent } from "./start/start-audit.event.dto";
import { EncService } from "src/enc/enc.service";
import { BeforeInit } from "src/users/users.service";
import { content } from "googleapis/build/src/apis/content";
import { RedisService } from "src/redis/redis.service";
import { SystemGateway } from "src/system/system.gateway";
import { EventEmitter2 } from "@nestjs/event-emitter";
@EventsHandler(CacheQuestionEvent)
export class CacheQuestionEventHandler implements IEventHandler<CacheQuestionEvent> {
    constructor(private readonly geminiServ: GeminiService,
        private readonly couchbaseServ: CouchbBaseService,
        private readonly encService: EncService,
        private readonly redisServ: RedisService,
        private readonly eventEmitter: EventEmitter2
    ) { }
    async handle(event: CacheQuestionEvent) {
        const { metadataUser, createdAt, encKey, ivKey } = event
        try {
            let allMessage = new Map<string, any>();
            const { userID, fullName, tall, weight, age } = metadataUser


            let userIDEnc = await this.encService.enc(encKey, ivKey, userID.toString())
            let cacheQuestion = await this.couchbaseServ.get('AI', `question:${userIDEnc}`)

            if (cacheQuestion.content !== null) {
                console.debug("this action cache")
                //this action to cache prompt

                let gemini = await this.geminiServ.sendInUseCache(fullName, age, cacheQuestion)
                gemini = gemini.message.replace(/\*/g, '')
                gemini = gemini.replace(/\n/g, "")
                gemini = gemini.replace(/"([^"]*)"/g, "'$1'")
                gemini = gemini.replace(/```/g, "")
                gemini = gemini.replace("json")
                gemini = gemini.split("'").map(item => item.trim()).filter(Boolean).slice(1)

                gemini = gemini.filter(item => item !== ',')
                allMessage.set(userIDEnc, gemini)
            } else {
                let gemini = await this.geminiServ.sender(fullName, age, 5)
                gemini = gemini.message.replace(/\*/g, '')
                gemini = gemini.replace(/\n/g, "")
                gemini = gemini.replace(/"([^"]*)"/g, "'$1'")
                gemini = gemini.replace(/```/g, "")
                gemini = gemini.replace("json")
                gemini = gemini.split("'").map(item => item.trim()).filter(Boolean).slice(1)

                gemini = gemini.filter(item => item !== ',')
                allMessage.set(userIDEnc, gemini)
            }


            if (allMessage) {
                const publishSocketEmit = {
                    client: userIDEnc,
                    message: allMessage
                }
                await this.redisServ.lock(`question_socket:${userIDEnc}`, {
                    userID: userIDEnc,
                    content: JSON.stringify(publishSocketEmit)
                })
            }

            await this.couchbaseServ.upset(userIDEnc, 'AI', `question:${userIDEnc}`, allMessage.get(userIDEnc))

            await this.eventEmitter.emitAsync("question_socket",
                {
                    userID: userID,
                    encKey: encKey,
                    ivKey: ivKey,
                    userIDEnc: userIDEnc,
                    messages: allMessage.get(userIDEnc)
                }
            )
        } catch (error) {
            console.error(error.message)
        }
    }

}