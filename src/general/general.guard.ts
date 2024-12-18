import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class GeneralGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) { }

  async canActivate(
    context: ExecutionContext,
  ): Promise<any> {
    try {
      const ctx = context.switchToHttp()
      const req = ctx.getRequest()
      const res = ctx.getResponse()

      let authHeader = req.headers.authorization

      if (!authHeader)
        return false

      const verif = await this.jwt.verifyAsync(authHeader)
      return verif.userName
    } catch (error) {
      console.error(error.message)
    }
  }
}
