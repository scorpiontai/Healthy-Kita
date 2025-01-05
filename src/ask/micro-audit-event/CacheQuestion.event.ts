import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CacheQuestionEvent } from "./cache-question-event.dto";
import { GeminiService } from "src/gemini/gemini.service";
import { CouchbBaseService } from "src/couchbase/couchbase.service";
import { RedisService } from "src/redis/redis.service";
import { SystemGateway } from "src/system/system.gateway";
import { Logger } from "@nestjs/common";
@EventsHandler(CacheQuestionEvent)
export class CacheQuestionEventHandler implements IEventHandler<CacheQuestionEvent> {
    constructor(private readonly geminiServ: GeminiService,
        private readonly couchbaseServ: CouchbBaseService,
        private readonly redisServ: RedisService,
        private readonly systemGatewaySocket: SystemGateway
    ) { }
    async handle(event: CacheQuestionEvent) {
        const { userIDEnc } = event


        const unlocked = await this.redisServ.unlocked(`generate_question`)
        const { userIdEncs, fullName, tall,
            age, weight, intensActivity } = unlocked


        Logger.debug("all lock is", fullName, tall, age, weight, intensActivity)
        try {
            let allMessage
            let cacheQuestion = await this.couchbaseServ.get('AI', `question:${userIdEncs}`)

            if (cacheQuestion.content !== null) {
                //this action to cache prompt

                let gemini = await this.geminiServ.sendInUseCache(fullName, age, weight, tall, intensActivity, cacheQuestion)
                gemini = gemini.message.replace(/\*/g, '')
                gemini = gemini.replace(/\n/g, "")
                gemini = gemini.replace(/"([^"]*)"/g, "'$1'")
                gemini = gemini.replace(/```/g, "")
                gemini = gemini.replace("json")
                gemini = gemini.split("'").map(item => item.trim()).filter(Boolean).slice(1)

                gemini = gemini.filter(item => item !== ',')
                allMessage = gemini
            } else {
                let gemini = await this.geminiServ.sender(fullName, intensActivity, age, intensActivity)
                gemini = gemini.message.replace(/\*/g, '')
                gemini = gemini.replace(/\n/g, "")
                gemini = gemini.replace(/"([^"]*)"/g, "'$1'")
                gemini = gemini.replace(/```/g, "")
                gemini = gemini.replace("json")
                gemini = gemini.split("'").map(item => item.trim()).filter(Boolean).slice(1)

                gemini = gemini.filter(item => item !== ',')
                allMessage = gemini
            }


            if (allMessage) {
                await this.couchbaseServ.upset(userIdEncs, 'AI', `question:${userIdEncs}`, allMessage)


                await this.redisServ.lock(`question_socket`,
                    {
                        content: {
                            userIDEnc: userIdEncs
                        }
                    }
                )
                await this.systemGatewaySocket.
                    distributedQuestion(`question_socket`)
            }

        } catch (error) {
            console.error(error.message)
        }
    }

}