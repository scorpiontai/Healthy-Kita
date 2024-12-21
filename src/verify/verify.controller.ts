import {
    Response, Request,
    Logger,
    UseGuards
} from '@nestjs/common';
import { Controller, Get, Post, Put, Delete, Res, Req, Body, Param, Query } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GeneralGuard } from 'src/general/general.guard';
import { users } from 'src/models/users.models';
import { RedisService } from 'src/redis/redis.service';
import { Users } from 'src/users/DTO/users.dto'
@Controller('verify')
export class VerifyController {
    constructor(private readonly redis: RedisService,
        private readonly jwt: JwtService
    ) { }
    @Get("email")
    async verifyEmail(@Query("code") code: string, @Query("email") email: string): Promise<any> {
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
                message = 'sukses terverifikasi'
            } else {
                message = "failed"
            }

            return ({ message: message })
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
}
