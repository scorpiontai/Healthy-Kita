import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt';
import { users } from 'src/models/users.models';
import { BeforeInit } from 'src/users/users.service';
@Injectable()
export class ChangesPwGuard implements CanActivate {
  constructor(private readonly jwt: JwtService,
    private readonly BeforeInit: BeforeInit
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<any> {
    try {
      const ctx = context.switchToHttp()
      const req: Request = ctx.getRequest()
      const res: Response = ctx.getResponse()

      const { email } = req.params
      let { tokenUser } = req.cookies


      let userName = await this.BeforeInit.decodeToken(tokenUser)

      //check email with username
      const find = await users.findOne({
        where: {
          username: userName
        }, attributes: ['email']
      })

      return find.email === email //return true or false for guard, true are expect email same by email user
    } catch (error) {
      console.error(error.mesasge)
      return false
    }
  }
}
