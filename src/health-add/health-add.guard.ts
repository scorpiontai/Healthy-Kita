import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt';
import { users } from 'src/models/users.models';
import { BeforeInit } from 'src/users/users.service';
import { OauthController } from 'src/oauth/oauth.controller';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class HealthAddGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly Beforenit: BeforeInit,
    private readonly oauth: OauthController,
    private readonly redisServ: RedisService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<any> {
    try {
      const ctx = context.switchToHttp()
      const req: Request = ctx.getRequest()
      const res: Response = ctx.getResponse()
      let { tokenUser } = req.cookies

      if (tokenUser.includes("ey")) {
        const decode = await this.Beforenit.decodeToken(tokenUser)
        let { userID } = decode

        return true
      } else{
        
      }
    } catch (error) {
      console.error(error.message)
    }
  }
}