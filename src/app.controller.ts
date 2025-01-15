import { Controller, Get, Post, Res, Req, Body } from '@nestjs/common';
import { Response, Request } from 'express';
import { BeforeInit, UsersService } from './users/users.service';
import { Users } from './users/DTO/users.dto';
import { EncService } from './enc/enc.service';
import { users } from './models/users.models';
import { RedisService } from './redis/redis.service';
import { KafkaService } from './kafka/kafka.service';

@Controller("api")
export class AppController {
  constructor(
    private readonly userService: UsersService,
    private readonly enc: EncService,
    private readonly BeforeInit: BeforeInit,
    private readonly redisServ: RedisService,
    private readonly kafkaServ: KafkaService,
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
      console.debug(username, password, remember)

      if (!username && !password)
        return { message: "harap inputkan dengan benar" }

      const loginned = await this.userService.login(username, password, remember)

      if (loginned) {

        remember === "true" ? res.status(200).cookie("tokenUser", loginned.token, { httpOnly: true, secure: true, maxAge: 10 * 60 * 60 * 1000, sameSite: 'none' }) :
          res.status(200).cookie("tokenUser", loginned.token, { httpOnly: true, secure: true, maxAge: 10 * 60 * 1000, sameSite: 'none' })

        //set enc key and enc iv
        const encInfo = await users.findOne({
          where: {
            encInfo: 0
          },
          attributes: ['encInfo'], raw: true
        })

        if (encInfo.encInfo === 0) {
          await users.update({
            encInfo: 1
          }, {
            where: {
              encInfo: 0,
              username: username
            }
          })
          const allEncAndIV = await this.enc.set()
          res.status(200).json({ message: loginned.message, encKeyIv: allEncAndIV })
        } else {
          res.status(200).json({ message: loginned.message })
        }

      } else {
        return ({ message: "gagal untuk mencoba login, mungkin anda belum terverifikasi" })
      }
    } catch (err) {
      console.error(err.message);
    }
  }


  @Post("recovery/password")
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

  @Get("get/credentials")
  async getCredentials(@Req() req: Request, @Res() res: Response): Promise<any> {
    try {
      const { tokenUser } = req.cookies

      if (tokenUser.includes("@")) {
        const check = await this.redisServ.get(`token:${tokenUser}`)

        if (!check) {
          return res.status(200).json({ redirect: `http://localhost:6060/oauth/google` })
        } else {
          return res.status(200).json({ tokenUser: tokenUser, redireect: false })
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  }
}

