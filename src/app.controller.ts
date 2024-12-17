import { Controller, Get, Post, Put, Delete, Res, Req, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { Response, Request } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { Users } from './users/DTO/users.dto';
@Controller("api")
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly userService: UsersService
  ) { }


  @Post("signup/user")
  async set(@Body() body: Users): Promise<any> {
    try {
      const { username, password, email } = body
      const created = await this.userService.signup(username, password, email)
      await this.userService.sendVerifyMessage(email) //send verify
      return ({ message: created })
    } catch (err) {
      console.error(err.message);
    }
  }
  @Post("login/user")
  async login(@Body() body: Users): Promise<any> {
    try {
      const { username, password } = body
      const loginned = await this.userService.login(username, password)
      return ({ message: loginned })
    } catch (err) {
      console.error(err.message);
    }
  }
}
