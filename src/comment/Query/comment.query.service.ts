import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentQuery } from "../DTO/comment.query";
import { CassandraService } from "src/cassandra/cassandra.service";
import { Logger } from "@nestjs/common";
@QueryHandler(CommentQuery)

export class CommentQueryService implements IQueryHandler<CommentQuery> {
    constructor(
        private readonly cassandraServ: CassandraService
    ) { }
    async execute(query: CommentQuery): Promise<any> {
        try {
            const { uuidComment, uuidPost, userID } = query
            Logger.debug(uuidComment, uuidPost, userID)
            const result = await this.cassandraServ.getCommentFromUUIDAndUserID(userID, uuidComment, uuidPost)

            return result.Row
        } catch (error) {
            console.error("error comment query", error.message)
        }
    }
}