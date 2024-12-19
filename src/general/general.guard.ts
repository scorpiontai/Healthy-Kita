import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import axios from 'axios'
@Injectable()
export class GeneralGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) { }

  //
  async oAuth(): Promise<any> {
    try {

    } catch (err) {
      console.error(err.message);
    }
  }
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
      if (authHeader.startsWith('ey')) {
        const verif = await this.jwt.verifyAsync(authHeader)
        return verif.userName
      } else {
        const find = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${authHeader}`)
        const dataGoogle = await find.data
        return dataGoogle.email.length > 0 && dataGoogle.email !== undefined && dataGoogle.email !== null ? true : res.status(301).redirect(`http://localhost:8080/login`) // halaman login fron
      }



    } catch (error) {
      console.error(error.message)
    }
  }
}
