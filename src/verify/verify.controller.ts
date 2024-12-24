import {
    Request,
    Logger,
    UseGuards
} from '@nestjs/common';
import { Controller, Get, Post, Put, Delete, Res, Req, Body, Param, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { GeneralGuard } from 'src/general/general.guard';
import { users } from 'src/models/users.models';
import { RedisService } from 'src/redis/redis.service';
import { Users } from 'src/users/DTO/users.dto'
import axios from 'axios'
import { ChangesPwGuard } from 'src/changes-pw/changes-pw.guard';
@Controller('verify')
export class VerifyController {
    constructor(private readonly redis: RedisService,
        private readonly jwt: JwtService
    ) { }
    @Get("email/:code")
    async verifyEmail(@Param("code") code: string, @Query("email") email: string, @Res() res: Response): Promise<any> {
        try {
            const codeFInd = await this.redis.get(`${email}:verifyCode`)

            let message
            if (codeFInd.length > 1) {
                await this.redis.del(`${email}:verifyCode`)
                const find = await users.findOne({
                    where: {
                        email: email
                    }, raw: true, attributes: ['verify']
                })
                find.verify === 0 ? await users.update({ verify: 1 }, { where: { email: email } }) : null
                message = true
            } else {
                message = false
            }

            if (message)
                return res.status(301).redirect('http://localhost:8080/login')
        } catch (err) {
            console.error(err.message);
        }
    }

    @Get("token")
    @UseGuards(GeneralGuard)
    async verifyTokenBeforeNext(@Req() req: any): Promise<any> {
        try {
            return { message: true }
        } catch (err) {
            console.error(err.message);
        }
    }

    @UseGuards(ChangesPwGuard)
    @Get("forgotPw/:email")
    async firgotpw(@Param("email") email: string, @Query("code") code: string): Promise<any> {
        try {
            const emailKeyStore = await this.redis.get(`recover:${email}`)
            return emailKeyStore === code ?
                await axios.get(`forgotPw/${email}`, {
                    headers: {
                        changesPwCode: code
                    }
                }) : null
        } catch (err) {
            console.error(err.message);
        }
    }
}
