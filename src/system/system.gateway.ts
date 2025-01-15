import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { askCommandDTO } from 'src/ask/asjk.command-dto';
import { BeforeInit } from 'src/users/users.service';
import { Socket, Server } from 'socket.io';
import { AnswerCommand } from 'src/answer/DTO/answer-command.dto';
import { EncService } from 'src/enc/enc.service';
import { OnModuleDestroy } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { AskQueryResult } from 'src/ask/ask-query.query.dto';
import { oauthService } from 'src/oauth/oauth.controller';
import { GuardStart } from 'src/ask/guard/guard.start.quiz';
import { QuizGuard } from 'src/ask/guard/DTO/QuizGuard..dto';
@WebSocketGateway({
  cors: {
    origin: "*",
  }
})
export class SystemGateway implements OnModuleDestroy {
  private readonly map = new Map()
  constructor(private readonly commandBus: CommandBus,
    private readonly BeforeInit: BeforeInit,
    private readonly queryBus: QueryBus,
    private readonly encServ: EncService,
    private readonly redisServ: RedisService,
    private readonly oauth: oauthService
  ) { }

  @WebSocketServer()
  server: Server
  client: Socket

  async cacheJoin(key, value): Promise<any> {
    try {
      this.map.set(key, value)
      setTimeout(() => {
        this.map.delete(key)
      }, 10 * 60 * 1000)
    } catch (err) {
      console.error(err.message);
    }
  }

  async getCacheJoin(key): Promise<any> {
    try {
      const find = await this.map.get(key)
      return find
    } catch (err) {
      console.error(err.message);
    }
  }

  @SubscribeMessage("join")
  async set(client: Socket, payload: any): Promise<any> {
    try {
      let { tokenUser, encKey, ivKey } = payload.init
      let userID
      let encID

      tokenUser = await this.BeforeInit.decodeToken(tokenUser)
      userID = tokenUser.userID

      encID = await this.encServ.enc(encKey, ivKey, userID.toString())
      client.join(encID)


      const guardQuery = await this.queryBus.execute(
        new QuizGuard(tokenUser)
      )
      this.server.to(encID).emit("guard", { status: guardQuery })
    } catch (err) {
      console.error(err.message);
    }
  }


  @SubscribeMessage("start")
  async startOfAudit(client: Socket, payload: any): Promise<any> {
    let { tokenUser, encKey, ivKey } = payload.init
    let userID
    let encID

    try {
      tokenUser = await this.BeforeInit.decodeToken(tokenUser)
      userID = tokenUser.userID
      encID = await this.encServ.enc(encKey, ivKey, userID.toString())

      const check = await this.redisServ.get(`start:${encID}`)

      if (!check) {
        //start lock
        await this.redisServ.set(`start:${encID}`, 1)
        let commandBus =
          await this.commandBus.execute(
            new askCommandDTO(
              userID,
              encKey,
              ivKey))
        console.debug("start", commandBus.client)
        this.server.to(commandBus.client)
          .emit("responseStart", {
            message: commandBus.message
          })
      } else {
        console.debug(encID)
        this.server.to(encID).emit("responseStart",
          { status: 409, previous: true }
        )
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  @SubscribeMessage("submitted")
  async submitted(@MessageBody() payload: any): Promise<any> {
    try {
      let { tokenUser, encKey, ivKey } = payload.init
      let userID
      let encID


      tokenUser = await this.BeforeInit.decodeToken(tokenUser)
      userID = tokenUser.userID
      encID = await this.encServ.enc(encKey, ivKey, userID.toString())
      let question = payload.answer


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

      const check = await this.redisServ.get(`start:${userIDEnc}`)

      if (check) {
        await this.redisServ.del(`start:${userIDEnc}`)
        //deleted for lock validation
      }

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
  onModuleDestroy() {
    this.server.close()
  }
}
