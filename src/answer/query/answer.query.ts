import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AnswerCommand } from "../DTO/answer-command.dto";
import { RedisService } from "src/redis/redis.service";
import { EncService } from "src/enc/enc.service";
import { SystemGateway } from "src/system/system.gateway";
import { Logger } from "@nestjs/common";
import { ClickhouseService } from "src/clickhouse/clickhouse.service";
import { AnswerQueryRead } from "../DTO/answer-query-read.dto";

@QueryHandler(AnswerQueryRead)
export class AnswerQueryService implements IQueryHandler<AnswerQueryRead> {
    constructor(
        private readonly systemGatewaySocket: SystemGateway,
        private readonly redisServ: RedisService,
        private readonly encServ: EncService,
        private readonly clickhouseServ: ClickhouseService
    ) { }
    async execute(query: AnswerQueryRead): Promise<any> {
        const { userIDEnc } = query

        try {
            let get = await this.clickhouseServ.checkingUserDesc(
                `clickhouse:${userIDEnc}`, `
                    HealthyKita.chatPreferencesViewing`)
            /*
              const formattedText = get
          .replace(/\.\s+/g, '.\n\n')
          .replace(/:\s+/g, ':\n- ')
          .replace(/"\s+/g, '"\n');
          */
            return { client: userIDEnc, status: true, message: get }
        } catch (error) {
            console.error(error.message)
        }
    }
}