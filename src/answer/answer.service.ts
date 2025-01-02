import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerCommand } from './DTO/answer-command.dto';
import { KafkaService } from 'src/kafka/kafka.service';
import { RedisService } from 'src/redis/redis.service';
import { EncService } from 'src/enc/enc.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CouchbBaseService } from 'src/couchbase/couchbase.service';

@CommandHandler(AnswerCommand)
export class AnswerService implements ICommandHandler<AnswerCommand> {
    constructor(private readonly eventEmitter: EventEmitter2,
        private readonly redisServ: RedisService,
        private readonly encServ: EncService,
        private readonly kafkaServ: KafkaService,
        private readonly couchbaseServ: CouchbBaseService
    ) { }
    async execute(command: AnswerCommand): Promise<any> {
        let { userID, range, encKey, ivKey } = command
        try {
            //event emitter
            let userIDEnc = await this.encServ.enc(encKey, ivKey, userID.toString())
            range = range.map(item => item.text)

            const payload = {
                userIDEnc: userIDEnc,
                payload: range
            }

            //check / validation
            let validation = await this.couchbaseServ.get(`AI`, `question:${userIDEnc}`)
            validation = validation.content

            if (validation) {

                await this.redisServ.lock(`answer:${userIDEnc}`, {
                    userID: userIDEnc,
                    content: JSON.stringify(range)
                })

                const action =
                    range.length >= 8 ?
                        await this.eventEmitter.emit("submitted",
                            payload)
                        : false

                return { status: action }
            } else {
                return { status: false }
            }


        } catch (error) {
           // await this.kafkaServ.emitter("useAsk", { error: error.message })
        }
    }
}
