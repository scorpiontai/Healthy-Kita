import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Vote } from "./DTO/vote.dto";
import { KafkaService } from "src/kafka/kafka.service";
import { PostProcessingGateway } from "src/post-processing/post-processing.gateway";
import { RedisService } from "src/redis/redis.service";
import { Logger } from "@nestjs/common";

@CommandHandler(Vote)
export class VoteService implements ICommandHandler<Vote> {
    constructor(
        private readonly kafkaServ: KafkaService,
        private readonly postProcessingSocket: PostProcessingGateway,
        private readonly redisServ: RedisService
    ) { }
    async execute(command: Vote): Promise<any> {
        const { commentId, condition, userID } = command
        const voteKey = `${commentId}:VoteHandling`

        await this.redisServ.lock(voteKey, {
            content: {
                condition: condition,
                userID: userID
            }
        })

        try {
            //emit broker to vote event
            await this.kafkaServ.emitter("VoteHandling", {
                commentId: commentId
            })

            //send real time for response
            await this.postProcessingSocket.responseVote(voteKey)


            //emit broker to notification, notification for sender 
            await this.kafkaServ.emitter("notifications", {
                message: {
                    key: voteKey
                }
            })

        } catch (error) {
            console.error("vote command service error",
                error.message
            )
        }
    }
}