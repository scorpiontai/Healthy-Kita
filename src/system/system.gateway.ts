import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { askCommandDTO } from 'src/ask/asjk.command-dto';
import { BeforeInit } from 'src/users/users.service';
import { Socket, Server } from 'socket.io';
import { KafkaService } from 'src/kafka/kafka.service';
import { AnswerCommand } from 'src/answer/DTO/answer-command.dto';
import { EncService } from 'src/enc/enc.service';
import { askQueryResult } from 'src/ask/ask.query-result-dto';
import { notifEvent } from 'src/notif/DTO/notif-dt0.event';
import { Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { askQuery } from 'src/ask/ask.query-dto';
import { User } from 'couchbase';
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
      let { fullName, age, weight, tall } = payload.body
      tokenUser = await this.BeforeInit.decodeToken(tokenUser)

      let userID = tokenUser.userID
      const encID = await this.encServ.enc(encKey, ivKey, userID.toString())

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

  async responseResult(payload: any): Promise<any> {
    try {
      const { client, encKey, ivKey } = payload

      let respponse =
        await this.queryBus.execute(new AnswerCommand(
          client,
          'get',
          encKey,
          ivKey
        ))

      let message = respponse.message
      message = message.replace(/\\n/g, '')
      
      if (message) {
        await this.redisServ.unlock(`current_audit:${client}`)
        this.server.to(client).emit("responseAnswerAudit", {
          message: message
        })
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  async responseQuestion(payload: any): Promise<any> {
    try {
      const { client, encKey,
        ivKey, message} = payload

      this.server.to(client).emit("responseAudit",
       { message: message }
      )
    } catch (err) {
      console.error(err.message);
    }
  }

  onModuleDestroy() {
    this.server.close()
  }
}
