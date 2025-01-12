import { Resolver, Query, Context, Args, Int, Mutation } from '@nestjs/graphql';
import { GeneralResolverSchema } from '../DTO/general.resolve.schema';
import { Request } from 'express'
import { BeforeInit } from 'src/users/users.service';
import { EncService } from 'src/enc/enc.service';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuditList } from 'src/answer/query/Share/DTO/share-query.dto';
import { PublishPrepare } from 'src/post/DTO/publish.share';
import { RedisService } from 'src/redis/redis.service';
import { GeneralMutationSchema } from '../DTO/general.mutation';
import { addExternalInfo } from 'src/post/DTO/addExternalPublish.share.dto';
import { KafkaService } from 'src/kafka/kafka.service';
import { DraftPost } from 'src/DraftPost/DTO/DraftPost.dto';
import { Logger } from '@nestjs/common';
@Resolver(() => GeneralResolverSchema)
export class PublicResolver {
    constructor(
        private readonly BeforeInit: BeforeInit,
        private readonly encServ: EncService,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
        private readonly redisServ: RedisService,
        private readonly kafkaServ: KafkaService
    ) { }


    @Query(() => [GeneralResolverSchema])
    async ListOffAllAudit(@Args('limit', { type: () => Int }) limit: number,
        @Args("skip", { type: () => Int }) skip: number, @Context() context: { req: Request }): Promise<any> {
        try {
            let { enckey, ivkey }: any = context.req.headers
            enckey = JSON.parse(enckey)
            ivkey = JSON.parse(ivkey)

            let { tokenUser } = context.req.cookies
            tokenUser = await this.BeforeInit.decodeToken(tokenUser)
            console.debug("token user", tokenUser)
            const userIDEnc = await this.encServ.enc(enckey, ivkey, tokenUser.userID.toString())

            const listOfAll =
                await this.queryBus.execute(
                    new AuditList(userIDEnc, limit, skip))


            console.debug("user id enc", userIDEnc)

            return listOfAll
        } catch (err) {
            console.error(err.message);
        }
    }

    @Mutation(() => [GeneralMutationSchema])
    async makePublish(
        @Args("UUID", { type: () => String }) uuid: string,
        @Context() context: { req: Request }): Promise<any> {
        try {
            const cookies = context.req.cookies
            let { enckey, ivkey }: any = context.req.headers
            enckey = JSON.parse(enckey)
            ivkey = JSON.parse(ivkey)

            let { tokenUser } = context.req.cookies
            tokenUser = await this.BeforeInit.decodeToken(tokenUser)

            const userIDEnc = await this.encServ.enc(enckey, ivkey,
                tokenUser.userID.toString())
            const publishAction = await this.commandBus.
                execute(new PublishPrepare(userIDEnc, uuid))


            if (publishAction != 'exists') {
                await this.redisServ.lockForPublish(`publishBy: ${userIDEnc}`,
                    {
                        content: {
                            uuid: uuid
                        }
                    }
                )
                return [
                    {
                        status: 200,
                        message: {
                            uuid: uuid,
                            createdAt: new Date().toISOString()
                        }
                    }
                ]
            } else if (publishAction === "exists") {
                return [
                    {
                        status: 400,
                        message: publishAction
                    }
                ]
            }
        } catch (err) {
            console.error("make Publish", err.message);
        }
    }


    @Mutation(() => GeneralMutationSchema)
    async editPublishAndSubmition(
        @Args("publish", { type: () => Number },
        ) publish: number,
        @Args("title", { type: () => String })
        title: string,
        @Args("commentAllow", { type: () => Number },
        ) commentAllow: number,
        @Args("description", { type: () => String },
        ) description: string,
        @Args("url", { type: () => String },
        ) url: string,
        @Context() context: { req: Request }): Promise<any> {
        try {
            let { enckey, ivkey }: any = context.req.headers
            enckey = JSON.parse(enckey)
            ivkey = JSON.parse(ivkey)

            let { tokenUser } = context.req.cookies
            tokenUser = await this.BeforeInit.decodeToken(tokenUser)

            const userIDEnc = await this.encServ.enc(enckey, ivkey,
                tokenUser.userID.toString())

            // this is only for testing
            await this.redisServ.lockForPublish(`publishBy: ${userIDEnc}`,
                {
                    content: {
                        uuid: '65876486-acea-4e96-9260-7ead968a0974'
                    }
                }
            )

            const unlock = await this.redisServ.unlock(`publishBy: ${userIDEnc}`)
            const { uuid } = unlock

            //command 
            const action =
                await this.commandBus.execute(
                    new addExternalInfo(
                        uuid,
                        publish,
                        commentAllow,
                        title,
                        description,
                        url
                    )
                )



            if (action.status) {
                await this.redisServ.unlockedForPublish(`publishBy: ${userIDEnc}`)
                await this.kafkaServ.emitter("notifications", {
                    userID: tokenUser.userID,
                    message: `Anda baru saja mempublish postingan audit anda.
                ${url}`
                })
                return {
                    status: 200,
                    message: action.message
                }
            } else {
                return {
                    status: 409,
                    message: action.message
                }
            }
        } catch (err) {
            Logger.error("edit Pub func error",
                err.message)
        }
    }

    @Query(() => [GeneralResolverSchema])
    async inPostList(
        @Args("limit", { type: () => Int }) limit: number,
        @Args("skip", { type: () => Int }) skip: number,
        @Context() context: { req: Request }): Promise<any> {
        try {
            let { enckey, ivkey }: any = context.req.headers
            enckey = JSON.parse(enckey)
            ivkey = JSON.parse(ivkey)

            let { tokenUser } = context.req.cookies
            tokenUser = await this.BeforeInit.decodeToken(tokenUser)
            const userIDEnc = await this.encServ.enc(enckey, ivkey, tokenUser.userID.toString())

            console.debug(userIDEnc)
            const allList =
                await this.queryBus.execute(
                    new PublishPrepare({ ID: userIDEnc, limit: limit }, "null")
                )
            console.debug("all list",
                allList)
            return allList
        } catch (err) {
            console.error(err.message);
        }
    }


    @Query(() => [GeneralResolverSchema])
    async DraftData(@Context() context: { req: Request }): Promise<any> {
        try {
            let { enckey, ivkey }: any = context.req.headers
            enckey = JSON.parse(enckey)
            ivkey = JSON.parse(ivkey)

            let { tokenUser } = context.req.cookies
            tokenUser = await this.BeforeInit.decodeToken(tokenUser)
            console.debug(tokenUser.userID.toString())

            const userIDEnc = await this.encServ.enc(enckey, ivkey, tokenUser.userID.toString())
            const get = await this.queryBus.execute(
                new DraftPost(`publishBy: ${userIDEnc}`)
            )

            return [{
                uuid: get
            }]
        } catch (err) {
            console.error(err.message);
        }
    }
}
