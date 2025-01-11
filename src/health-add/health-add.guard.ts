import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express'
import { JwtService } from '@nestjs/jwt';
import { BeforeInit } from 'src/users/users.service';
import { oauthService } from 'src/oauth/oauth.controller';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class HealthAddGuard implements CanActivate {
  constructor(
    private readonly oauth: oauthService,
    private readonly redisServ: RedisService
  ) { }
  async canActivate(
    context: ExecutionContext,
  ): Promise<any> {
    try {
      const ctx = context.switchToHttp();
      const req: Request = ctx.getRequest();
      const res: Response = ctx.getResponse();


      let { tokenUser } = req.cookies;

      if (typeof tokenUser === 'string' && tokenUser.includes("ey")) {
        return true
      } else if (tokenUser.includes("@")) {
        const token = await this.redisServ.get(`token:${tokenUser}`)
        if (token) {
          console.log("this", !token)
          const verif = await this.oauth.HandlingIfAlreadyHaveToken(token)
          return verif.status
        } else {
          return res.redirect(`http://localhost:6060/oauth/google/`)
        }
      } else {
        return res.redirect(`http://localhost:6060/oauth/google/`)
      }

    } catch (error) {
      console.error(error.message)
    }
  }
}