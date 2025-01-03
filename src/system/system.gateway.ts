import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { askCommandDTO } from 'src/ask/asjk.command-dto';
import { BeforeInit } from 'src/users/users.service';
import { Socket, Server } from 'socket.io';
import { KafkaService } from 'src/kafka/kafka.service';
import { AnswerCommand } from 'src/answer/DTO/answer-command.dto';
import { EncService } from 'src/enc/enc.service';
import { askQueryResult } from 'src/ask/ask.query-result-dto';
import { notifEvent } from 'src/notif/DTO/notif-dt0.event';
import { OnModuleDestroy } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
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
    private readonly notifEvent: notifEvent,
    private readonly redisServ: RedisService
  ) { }
  @WebSocketServer()
  server: Server
  client: Socket


  @SubscribeMessage("start")
  async startOfAudit(client: Socket, payload: any): Promise<any> {
    try {

      let { tokenUser, encKey, ivKey, } = payload.init
      let { fullName, age, weight, tall } = payload.body
      tokenUser = await this.BeforeInit.decodeToken(tokenUser)

      let userID = tokenUser.userID
      const encID = await this.encServ.enc(encKey, ivKey, userID.toString())
      client.join(encID)

      const guard = await this.redisServ.get(`current_audit:${encID}`)

      if (guard) {
        this.server.to(encID).emit("responseAudit", `harap jawab dulu pertanyaan 
          audit sebelumnya`)
      }

      const commandAction =
        await this.commandBus.execute(
          new askCommandDTO(
            userID,
            encKey,
            ivKey,
            fullName ? fullName : tokenUser.fullName,
            tall = tall ? tall : tokenUser.tall,
            weight ? weight : tokenUser.weight))

      if (commandAction.status) {
        setTimeout(async () => {
          let responseData =
            await this.queryBus.execute(
              new askQueryResult(
                userID,
                encKey,
                ivKey))

          if (responseData.status && responseData.current === 'now') {
            this.server.to(responseData.client).emit("responseAudit",
              responseData.message)
          }
        }, 5000);
      }
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
      const userID = tokenUser.userID

      const encID = await this.encServ.enc(encKey, ivKey, userID.toString())
      const guard = await this.redisServ.get(`current_audit:${encID}`)

      if (guard) {
        this.server.to(encID).emit("responseAudit", `harap jawab dulu pertanyaan 
          audit sebelumnya`)
      }


      const submit = await this.commandBus.execute(
        new AnswerCommand(
          userID,
          question,
          encKey,
          ivKey))

      let responseData = await this.queryBus.execute(
        new AnswerCommand(
          userID,
          'get',
          encKey,
          ivKey
        ))

      if (responseData.status) {
        const client = responseData.client
        const message = responseData.message
        this.server.to(client).emit("responseSubmitted",
          { message: message })
      }

    } catch (err) {
      console.error(err.message);
    }
  }
  onModuleDestroy() {
    this.server.close()
  }
}