import { Injectable, Logger } from '@nestjs/common'
import { CommandHandler, EventBus, EventsHandler, ICommandHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import * as dotenv from 'dotenv'
import path from 'path'
import { resolve } from 'path'
import { askCommandDTO } from './asjk.command-dto';
import { AuditEvent } from './audir-event.dto';
import { TimeService } from '../time/time.service';
import { notifEvent } from '../notif/DTO/notif-dt0.event';
import { AischemaService } from '../mongoose/aischema/aischema.service';
import { SystemGateway } from '../system/system.gateway';
import { GeminiService } from '../gemini/gemini.service';
import { EncService } from '../enc/enc.service';
import { askQuery } from './ask.query-dto';
import { isBIC } from 'class-validator';
import { AskQuery } from './ask.query';
import { askQueryResult } from './ask.query-result-dto';
import { AuditError } from './audit-error';
import { auditError } from './audit-error.dto';
import { audit } from 'rxjs';
import { KafkaService } from 'src/kafka/kafka.service';
import { CouchbBaseService } from 'src/couchbase/couchbase.service';
import { CacheQuestionEvent } from './micro-audit-event/cache-question-event.dto';
import { startAuditEvent } from './micro-audit-event/start/start-audit.event.dto';
import { RedisService } from 'src/redis/redis.service';
import { time } from 'console';
dotenv.config({ path: resolve('./src/.env') });


//all controll event
@EventsHandler(AuditEvent)
export class auditEvent implements IEventHandler<AuditEvent> {
    constructor(
        private readonly eventBus: EventBus,
        private readonly redisServ: RedisService,
        private readonly encServ: EncService,
        private readonly timeServ: TimeService
    ) { }
    async handle(event: AuditEvent) {
        const { userID, timestamp, keyEnc, ivEnc } = event
        try {
            //timestamp history need required 
            let userIDEnc = await this.encServ.enc(keyEnc, ivEnc, userID.toString())

            const get = await this.redisServ.get(`physic:${userID}`)
            if (get !== undefined) {
                //distsributed lock start key
                //this need action
                await this.redisServ.lock(`start:${userIDEnc}`, {
                    userID: userIDEnc,
                    content: await this.timeServ.localeString()
                })
            }
        } catch (error) {
            console.error(error.message)
        }
    }

}
