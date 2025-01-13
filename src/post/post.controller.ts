import {
    Request,
    Logger,
    UseGuards,
    ParseIntPipe
} from '@nestjs/common';
import {
    Controller, Get, Post, Put, Delete, Res, Req, Body, Param, Query,
    UseInterceptors
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CommentQuery } from 'src/comment/DTO/comment.query';
import { CommentAllPost } from 'src/comment/DTO/commment.all-post.query.dto';
import { ContentForUrlName } from './DTO/contentForUrlName.share.query.dto';
import { Response } from 'express'
import { VoteRead } from 'src/vote/DTO/vote.query.dto';
import { ParsingInterceptor } from 'src/parsing/parsing.interceptor';
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

            Logger.debug(showComment)

            return { showComment }
        } catch (err) {
            console.error(err.message);
        }
    }

    /*
    curl http://localhost:6060/post/view/content/65876486-acea-4e96-9260-7ead968a0974/makanan-enak-dan-segar/10
    */

    @Get("view/comment/post/:analyticPostUUID/:linkName/:limit")
    async viewPostAnalyticLInk(@Param("analyticPostUUID") uuidPost: string,
        @Param("linkName") urlName: string,
        @Param("limit", ParseIntPipe) limit: number): Promise<any> {
        try {
            const find = await this.queryBus.execute(
                new CommentAllPost(uuidPost, urlName, limit)
            )
            return { commentar: find }
        } catch (err) {
            console.error(err.message)
        }
    }
    /*
    curl http://localhost:6060/post/view/content/65876486-acea-4e96-9260-7ead968a0974/makanan-enak-dan-segar
    */
    @Get("view/content/:uuid/:urlName")
    async postContent(@Param("uuid") uuid: string,
        @Param("urlName") urlName: string): Promise<any> {
        try {
            const find = await this.queryBus.execute(
                new ContentForUrlName(uuid, urlName)
            )
            return { find }
        } catch (err) {
            console.error(err.message)
        }
    }


    /*
    curl http://localhost:6060/post/view/condition/vote/10
    */
    @UseInterceptors(ParsingInterceptor)
    @Get("view/condition/vote/:limit")
    async viewConditionVoteWithCommentId(@Param("limit", ParseIntPipe) limit: number,
        @Req() req: any): Promise<any> {
        try {
            let { userID } = req.allParse
            const find = await this.queryBus.execute(new
                VoteRead(userID, limit)
            )
            return { find }
        } catch (err) {
            console.error(err.message);
        }
    }

}
