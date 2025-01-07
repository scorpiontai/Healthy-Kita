import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { askCommandDTO } from 'src/ask/asjk.command-dto';
import { BeforeInit } from 'src/users/users.service';
import { Socket, Server } from 'socket.io';
import { AnswerCommand } from 'src/answer/DTO/answer-command.dto';
import { EncService } from 'src/enc/enc.service';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { AskQueryResult } from 'src/ask/ask-query.query.dto';
import { AnswerQueryRead } from 'src/answer/DTO/answer-query-read.dto';
@WebSocketGateway({
  cors: {
    origin: "*",
  }
})
export class SystemGateway implements OnModuleDestroy {
  constructor(private readonly commandBus: CommandBus,
    private readonly BeforeInit: BeforeInit,
    private readonly queryBus: QueryBus,
    private readonly encServ: EncService,
    private readonly redisServ: RedisService
  ) { }
  @WebSocketServer()
  server: Server
  client: Socket

  @SubscribeMessage("join")
  async set(client: Socket, payload: any): Promise<any> {
    try {
      let { tokenUser, encKey, ivKey, } = payload.init
      tokenUser = await this.BeforeInit.decodeToken(tokenUser)

      let userID = tokenUser.userID
      const encID = await this.encServ.enc(encKey, ivKey, userID.toString())
      client.join(encID)

      return { status: true }
    } catch (err) {
      console.error(err.message);
    }
  }


  @SubscribeMessage("start")
  async startOfAudit(client: Socket, payload: any): Promise<any> {
    try {

      let { tokenUser, encKey, ivKey, } = payload.init
      tokenUser = await this.BeforeInit.decodeToken(tokenUser)
      let userID = tokenUser.userID


      let commandBus =
        await this.commandBus.execute(
          new askCommandDTO(
            userID,
            encKey,
            ivKey))

      this.server.to(commandBus.client)
        .emit("responseStart", {

        })
    } catch (err) {
      console.error(err.message);
    }
  }

  @SubscribeMessage("submitted")
  async submitted(@MessageBody() payload: any): Promise<any> {
    try {

      let { tokenUser, encKey, ivKey } = payload.init
      let question = payload.answer
      tokenUser = await this.BeforeInit.decodeToken(tokenUser)
      let userID = tokenUser.userID

      await this.commandBus.execute(
        new AnswerCommand(
          userID,
          question,
          encKey,
          ivKey))
    } catch (err) {
      console.error(err.message);
    }
  }

  async distributedQuestion(key: string): Promise<any> {
    try {
      let unlock = await this.redisServ.unlocked(key)
      const { userIDEnc } = unlock

      let messages =
        await this.queryBus.execute(
          new AskQueryResult(userIDEnc)
        )

      const { message, craetedAt } = messages
      this.server.to(userIDEnc).emit("TheQuestion",
        { message: message, createdAt: craetedAt, next: true }
      )

    } catch (err) {
      console.error(err.message);
    }
  }

  async distributedAnswer(key: string): Promise<any> {
    try {
      let unlock = await this.redisServ.unlocked(key)
      const { userIDEnc, UUID } = unlock

      this.server.to(userIDEnc).emit("TheResult",
        {
          message: {
            UUID: UUID
          }, next: true
        }
      )
    } catch (err) {
      console.error(err.message);
    }
  }

  @SubscribeMessage("notifJoin")
  async notifJoin(client: Socket, payload: any): Promise<any> {
    try {
      let { tokenUser } = payload
      tokenUser = await this.BeforeInit.decodeToken(tokenUser)
      let userID = tokenUser.userID

      client.join(`notifications:${userID}`)
    } catch (err) {
      console.error(err.message);
    }
  }

  async notifReceivMessage(userID: number, messages: any): Promise<any> {
    try {
      this.server.to(`notifications:${userID}`).emit("notifReceiv", {
        message: messages
      })
    } catch (err) {
      console.error(err.message);
    }
  }
  onModuleDestroy() {
    this.server.close()
  }
}
