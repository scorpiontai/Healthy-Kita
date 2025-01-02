import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { AuditHisotryEvent } from "../DTO/audit-history.event.dto";
import { BeforeInit } from "src/users/users.service";
import { CouchbBaseService } from "src/couchbase/couchbase.service";
import { ClickhouseService } from "src/clickhouse/clickhouse.service";
import { RedisService } from "src/redis/redis.service";
import { EncService } from "src/enc/enc.service";
import { error } from "console";
import { KafkaService } from "src/kafka/kafka.service";


@EventsHandler(AuditHisotryEvent)
export class AuditHistoryService implements IEventHandler<AuditHisotryEvent> {
    constructor(
        private readonly clickhouseServ: ClickhouseService,
        private readonly redisServ: RedisService,
        private readonly kafkaServ: KafkaService
    ) { }
    async handle(event: AuditHisotryEvent) {
        const { calculationUserID, calculationMessage } = event
        try {
            //store conclusion
            await this.redisServ.lock(`conclusion:${calculationUserID}`,
                { userID: calculationUserID, content: calculationMessage })

            const conclusion = await this.redisServ.unlock(`conclusion:${calculationUserID}`)
            await this.redisServ.unlock(`start:${calculationUserID}`)
            await this.clickhouseServ.insert(calculationUserID, `HealthyKita.chatPreferences`, conclusion)

        } catch (err) {
            console.error(err.message)
            //emitter retry logic error
            await this.kafkaServ.emitter("submitted", {
                calcuulationUserID: calculationUserID,
                calculationMessage: calculationMessage
            })
        }
    }
}