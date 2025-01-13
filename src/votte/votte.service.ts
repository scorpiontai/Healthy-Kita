import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { VoteHandling } from "./DTO/vote.service.dto";
import { RedisService } from "src/redis/redis.service";
import { KafkaService } from "src/kafka/kafka.service";
import { CassandraService } from "src/cassandra/cassandra.service";
import { Logger } from "@nestjs/common";
@EventsHandler(VoteHandling)
export class VotteEvent implements IEventHandler<VoteHandling> {
    constructor(
        private readonly redisServ: RedisService,
        private readonly kafkaServ: KafkaService,
        private readonly cassandraServ: CassandraService
    ) { }
    async handle(event: VoteHandling) {
        const { key } = event
        //store at db with condition value
        //if failure, lock key
        console.debug("comment id", key)
        const voteEvent = await this.cassandraServ.voteCommentStore(key)
        console.debug("vote event success", voteEvent)
        try {

            let voteUnlock = await this.redisServ.unlock(`${key}:VoteHandling`)
            const { condition, userID } = voteUnlock


            const ErrorKeyComment = `Error:${key}_${userID}`
            await this.redisServ.lock(ErrorKeyComment, {
                content: {
                    condition: condition,
                    userID: userID
                }
            })

            //emit to error Notif
            await this.kafkaServ.emitter(`ErrorNotitications`, {
                message: {
                    key: ErrorKeyComment
                }
            })

        } catch (error) {
            console.error("error vote event handler",
                error.message
            )
        }
    }
}
