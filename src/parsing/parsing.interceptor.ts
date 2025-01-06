import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EncService } from 'src/enc/enc.service';
import { BeforeInit } from 'src/users/users.service';

@Injectable()
export class ParsingInterceptor implements NestInterceptor {
  constructor(
    private readonly BeforeInit: BeforeInit,
    private readonly jwtServ: JwtService,
    private readonly encServ: EncService
  ) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const { tokenUser } = req.cookies
    const { encKey, ivKey } = req.body

    if (await this.jwtServ.verify(tokenUser)) {
      const get = await this.BeforeInit.decodeToken(tokenUser)
      const userID = get.userID
      const userIDEnc = await this.encServ.enc(encKey, ivKey, userID.toString())
      req.allParse = { userID: userID, userIDEnc: userIDEnc }
    } else {
      req.allErrorParse = true
    }
    return next.handle();
  }
}
