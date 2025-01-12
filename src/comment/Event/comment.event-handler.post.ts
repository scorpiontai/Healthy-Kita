import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { CommentarUsers } from "../DTO/comment.dto";
import { RedisService } from "src/redis/redis.service";
import { randomUUID } from "crypto";
import { CassandraService } from "src/cassandra/cassandra.service";
import { PostProcessingGateway } from "src/post-processing/post-processing.gateway";
import { KafkaService } from "src/kafka/kafka.service";
import { Logger } from "@nestjs/common";

@EventsHandler(CommentarUsers)
export class CommentHandlerService implements IEventHandler<CommentarUsers> {
    constructor(private readonly redisServ: RedisService,
        private readonly cassandraServ: CassandraService,
        private readonly postProcessingGateway: PostProcessingGateway,
        private readonly kafkfaServ: KafkaService
    ) { }
    async handle(event: CommentarUsers) {
        const { uuidPost, content, userID } = event
        try {
            const commentID = randomUUID()
            const key = `${uuidPost}:${userID}_${new Date().toLocaleDateString()}`
            const payload = {
                content: {
                    uuid: randomUUID()
                }
            }
            await this.redisServ.lock(key, {
                content:
                {
                    uuid: randomUUID()
                }
            })
            const commentarAdd = await this.cassandraServ.commentarAdd(key, {
                userID: userID,
                postId: uuidPost,
                content: content,
            })

            if (!commentarAdd) {
                const keyResponse = `${uuidPost}:${userID}_${new Date().toLocaleDateString()}:Error`
                await this.redisServ.lock(keyResponse, {
                    content: {
                        uuid: 'error'
                    }
                })

                //error handling
                this.kafkfaServ.emitter(`notifications`, {
                    userID: userID,
                    message: { key: keyResponse }
                })
            } else {
                await this.postProcessingGateway.responseCommentar(`ResponseCommentar:${userID}:${uuidPost}`)
            }
        } catch (error) {
            console.error("commentar user error", error.message)
        }
    }
}