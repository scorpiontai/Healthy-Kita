import { Controller, Get, Post, Put, Delete, Res, Req, Body, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Response, Request } from 'express';
import { BeforeInit, UsersService } from './users/users.service';
import { Users } from './users/DTO/users.dto';
import { JwtService } from '@nestjs/jwt';
import { GeminiService } from './gemini/gemini.service';
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { EncService } from './enc/enc.service';
import { KafkaService } from './kafka/kafka.service';
import { MESSAGES } from '@nestjs/core/constants';
import { users } from './models/users.models';
import { RedisService } from './redis/redis.service';
import { Ctx, EventPattern, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';
import { retry } from 'rxjs';
import { time } from 'console';
import { TimeService } from './time/time.service';
import { askCommandDTO } from './ask/asjk.command-dto';
import { notifEvent } from './notif/DTO/notif-dt0.event';
@Controller("api")
/*

This API for user bassic credentials and security management
only rest, guard for authorization, cookie and heders for resource
thank you 

*/
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly userService: UsersService,
    private readonly jwt: JwtService,
    private readonly enc: EncService,
    private readonly kafka: KafkaService,
    private readonly BeforeInit: BeforeInit,
    private readonly redis: RedisService,
    private readonly encServ: EncService,
    private readonly timeServ: TimeService,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus
  ) { }


  @Post("signup/user")
  async set(@Body() body: Users): Promise<any> {
    try {
      const { username, password, email } = body
      const created = await this.userService.signup(username, password, email)
      return { message: created }
    } catch (err) {
      console.error(err.message);
    }
  }
  @Post("login/user")
  async login(@Body() body: Users, @Res() res: Response): Promise<any> {
    try {
      const { username, password, remember } = body
      console.debug(username,password,remember)

      if (!username && !password)
        return { message: "harap inputkan dengan benar" }

      const loginned = await this.userService.login(username, password, remember)

      if (loginned) {

        remember === "true" ? res.status(200).cookie("tokenUser", loginned.token, { httpOnly: true, secure: true, maxAge: 10 * 60 * 60 * 1000, sameSite: 'none' }) :
          res.status(200).cookie("tokenUser", loginned.token, { httpOnly: true, secure: true, maxAge: 10 * 60 * 1000, sameSite: 'none' })

        //set enc key and enc iv
        const allEncAndIV = await this.enc.set()
        res.status(200).json({ message: loginned.message, encKeyIv: allEncAndIV })
      } else {
        return ({ message: "gagal untuk mencoba login, mungkin anda belum terverifikasi" })
      }
    } catch (err) {
      console.error(err.message);
    }
  }


  @Post("recovery/password") //request recovery password
  async recoveryPassword(@Body() body: any, @Req() req: Request): Promise<any> {
    try {
      const { tokenUser } = req.cookies
      const { email } = body

      const message: string = await this.userService.recoveryPwSendToMail(email, tokenUser)
      return { message: message }
    } catch (err) {
      console.error(err.message);
    }
  }

  @Post("changes/pw") //api for changes password
  async changePw(@Body() body: any, @Req() req: Request): Promise<any> {
    try {
      const { newPw, changesPwCode } = body
      let { tokenUser } = req.cookies

      let userName = await this.BeforeInit.decodeToken(tokenUser)

      const find = await users.findOne({ where: { username: tokenUser }, raw: true, attributes: ['email'] })
      const email = find.email
      const keyStore = `recover:${email}`

      if (keyStore.length > 3 && changesPwCode === keyStore) {
        await users.update({ password: newPw }, {
          where: {
            username: userName,
            email: email
          }
        })
        return { message: `sukses mengganti kata sandi lama ke kata sandi baru` }
      } else {
        return { message: `gagal mengganti kata sandi lama ke kata sandi baru` }
      }
    } catch (err) {
      console.error(err.message);
    }
  }

}

