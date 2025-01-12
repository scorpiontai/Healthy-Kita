import {
    Request,
    Logger,
    UseGuards,
    ParseIntPipe
} from '@nestjs/common';
import { Controller, Get, Post, Put, Delete, Res, Req, Body, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CassandraService } from 'src/cassandra/cassandra.service';
import { CommentQuery } from 'src/comment/DTO/comment.query';
import { CommentAllPost } from 'src/comment/DTO/commment.all-post.query.dto';

@Controller('post')
export class PostController {
    constructor(
        private readonly queryBus: QueryBus
    ) { }
    /* 
    curl http://localhost:6060/post/view/comment/83/65876486-acea-4e96-9260-7ead968a0974/045c415f-2b60-45c8-bcf2-d55f5e9eb81e
    */
    @Get("view/comment/:userID/:uuidPost/:uuidComment")
    async ViewComment(@Param("userID", ParseIntPipe) userID: number,
        @Param("uuidPost") uuidPost: string,
        @Param("uuidComment") uuidComment: string): Promise<any> {
        try {
            const showComment = await this.queryBus.execute(
                new CommentQuery(uuidComment, uuidPost, userID)
            )

            return { showComment }
        } catch (err) {
            console.error(err.message);
        }
    }

    @Get("view/post/:analyticPostUUID/:linkName/:limit")
    async viewPostAnalyticLInk(@Param("analyticPostUUID") uuidPost: string,
        @Param("linkName") linkName: string,
        @Param("limit") limit: number): Promise<any> {
        try {
            const find = await this.queryBus.execute(
                new CommentAllPost(uuidPost, limit)
            )
            return { find }
        } catch (err) {
            console.error(err.message);
        }
    }
}
