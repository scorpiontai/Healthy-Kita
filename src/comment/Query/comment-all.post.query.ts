import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { CommentAllPost } from "../DTO/commment.all-post.query.dto";
import { AischemaService } from "src/mongoose/aischema/aischema.service";
import { CassandraService } from "src/cassandra/cassandra.service";

@QueryHandler(CommentAllPost)
export class CommentAllPostQuery implements IQueryHandler<CommentAllPost> {
    constructor(private readonly intros: AischemaService,
        private readonly cassandraServ: CassandraService
    ) { }
    async execute(query: CommentAllPost): Promise<any> {
        const { uuidPost, limit } = query
        try {
            //validation
            const find = await this.intros.findOneByUUID(uuidPost)

            if (!find) {
                return { status: 404, message: `tidak ada postingan tersebut` }
            }

            const getAllCommentByUuid = await this.cassandraServ.
                getAllCommentByUuid(uuidPost, limit)

            if (!getAllCommentByUuid) {
                return getAllCommentByUuid
            } else {
                return false
            }
        } catch (error) {
            console.error("error comment atll post", query)
        }
    }
}