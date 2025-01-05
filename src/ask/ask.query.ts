import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { SystemGateway } from 'src/system/system.gateway';
import { RedisService } from 'src/redis/redis.service';
import { EncService } from 'src/enc/enc.service';
import { CouchbBaseService } from 'src/couchbase/couchbase.service';
import { TimeService } from 'src/time/time.service';
import { AskQueryResult } from './ask-query.query.dto';
dotenv.config({ path: resolve('./src/.env') });

@QueryHandler(AskQueryResult)
export class AskQuery implements IQueryHandler<AskQueryResult> {
    constructor(private readonly systemSocketGateway: SystemGateway,
        private readonly systemGatewaySocket: SystemGateway,
        private readonly encServ: EncService,
        private readonly couchbaseServ: CouchbBaseService,
        private readonly redisServ: RedisService,
        private readonly timeServ: TimeService
    ) { }
    async execute(query: AskQueryResult): Promise<any> {
        let { userIDEnc } = query

        try {
            let question = await this.couchbaseServ.get(`AI`, `question:${userIDEnc}`)
            return {
                status: true, message: question.content, client: userIDEnc, currents: 'now',
                craetedAt: await this.timeServ.DateTimeSplitted()
            }
        } catch (error) {
            return {
                status: false, message: 'ada kesalahan pada sistem, harap coba lagi',
                client: userIDEnc
            }
            //retry logic required
        }
    }
}
