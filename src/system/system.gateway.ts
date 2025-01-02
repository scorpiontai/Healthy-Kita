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
    private readonly notifEvent: notifEvent
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

      const commandAction =
        await this.commandBus.execute(
          new askCommandDTO(
            userID,
            encKey,
            ivKey,
            fullName ? fullName : tokenUser.fullName,
            tall = tall ? tall : tokenUser.tall,
            weight ? weight : tokenUser.weight))

      let responseData =
        await this.queryBus.execute(
          new askQueryResult(
            userID,
            encKey,
            ivKey))

      responseData = {

        command: {
          statusBuild: commandAction.status,
          buildResponse: commandAction.message
        },

        query: {
          statusQuestion: responseData.status,
          responseAudit: responseData.message,
          client: responseData.client
        }

      }


      if (responseData.query.statusQuestion === true &&
        responseData.command.statusBuild === false &&
        responseData.query.client === encID) {

        const response = responseData.query.responseAudit
        const client = responseData.query.client
        this.server.to(client).emit("responseAudit",
          { question: response }
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
      let question = payload.answer
      tokenUser = await this.BeforeInit.decodeToken(tokenUser)
      const userID = tokenUser.userID
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
        this.server.to(responseData.client).emit("responseSubmitted",
          { message: responseData.message })
      }

    } catch (err) {
      console.error(err.message);
    }
  }
  onModuleDestroy() {
    this.server.close()
  }
}
