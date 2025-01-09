import { Controller, Get, Post, Res, Req, Body, UseGuards, Query, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { BeforeInit, UsersService } from './users/users.service';
import { Users } from './users/DTO/users.dto';
import { EncService } from './enc/enc.service';
import { users } from './models/users.models';
import { HealthAddGuard } from './health-add/health-add.guard'
@Controller("api")
/*

This API for user bassic credentials and security management
only rest, guard for authorization, cookie and heders for resource
thank you 

*/
export class AppController {
  constructor(
    private readonly userService: UsersService,
    private readonly enc: EncService,
    private readonly BeforeInit: BeforeInit
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
        const allEncAndIV = await this.enc.set()
        res.status(200).json({ message: loginned.message, encKeyIv: allEncAndIV })
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
  async getCredentials(@Req() req: Request): Promise<any> {
    try {
      const { tokenUser } = req.cookies
      return { tokenUser: tokenUser }
    } catch (err) {
      console.error(err.message);
    }
  }


  @UseGuards(HealthAddGuard)
  @Get("input/health/info")
  // curl http://localhost:6060/api/input/health/info  -b "tokenUser=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyTmFtZSI6InVzZXJUZXN0IiwiZW1haWwiOiJtaWtoYWVsamhvbjIyQGdtYWlsLmNvbSIsImlhdCI6MTczNjM3NTU2NywiZXhwIjoxNzM3MjM5NTY3fQ.j4CtNrMbwkO4Sy1ZXmeBf4RXGSnitLFC53BZqmsHoOc"
  async heatlthAdd(@Body() body: any, @Req() req: Request): Promise<any> {
    const { birthdate, intensActivity, weight, tall } = body
    let { tokenUser } = req.cookies
    tokenUser = await this.BeforeInit.decodeToken(tokenUser)
    let { userID } = tokenUser
    try {
      /*
      Logger.debug("user id health is ",
        userID
      )

      await users.update({
        birthdate: birthdate,
        intensActivityWeek: intensActivity,
        weight: weight,
        tall: tall
      }, {
        where: {
          ID: userID
        }
      })
        */
      return {
        status: 200,
        message: `sukses untuk mengedit`
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  @Post("oauth/get/credentials")
  async oauth(@Req() req: Request, @Body() body: any): Promise<any> {
    try {
      const { accessToken } = req.headers
      const { encKey, ivKey } = body

      
    } catch (err) {
      console.error(err.message);
    }
  }
}

