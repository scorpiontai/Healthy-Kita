import { EventBus, EventsHandler, IEventHandler, QueryBus } from "@nestjs/cqrs";
import { CalculationEvent } from "./DTO/calculation-event.dto";
import { Logger } from "@nestjs/common";
import { GeminiService } from "src/gemini/gemini.service";
import { CouchbBaseService } from "src/couchbase/couchbase.service";
import { ClickhouseService } from "src/clickhouse/clickhouse.service";
import { RedisService } from "src/redis/redis.service";
import { EncService } from "src/enc/enc.service";
import Redlock from 'redlock';
import { AnswerCommand } from "src/answer/DTO/answer-command.dto";
import { AuditHistoryService } from "./audit-histrory/audit-history.service";
import { AuditHisotryEvent } from "./DTO/audit-history.event.dto";
import { SystemGateway } from "src/system/system.gateway";
@EventsHandler(CalculationEvent)
export class CalculationService implements IEventHandler<CalculationEvent> {
    constructor(
        private readonly geminiServ: GeminiService,
        private readonly redisServ: RedisService,
        private readonly eventBus: EventBus,
        private readonly systemGateway: SystemGateway
    ) { }
    async handle(event: CalculationEvent) {
        let { userIDEnc } = event
        let get = await this.redisServ.unlocked(`answer`)

        try {
            let calculation = await this.geminiServ.calculationQuest(userIDEnc, get)
            let calculationMessage = calculation.message.replace(/\*/g, '')
            let calculationUserID = calculation.userIDEnc

            await this.redisServ.lock(`result`, {
                userID: calculationUserID, content: {
                    userIDEnc: calculationUserID
                }
            })

            await this.systemGateway.distributedAnswer('result')
            await this.eventBus.publish(
                new AuditHisotryEvent(calculationUserID,
                    calculationMessage))

        } catch (error) {
            console.error(error.message)
            return false
        }
    }
}
