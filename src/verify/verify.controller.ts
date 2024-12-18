import {
    Response, Request,
    Logger
} from '@nestjs/common';
import { Controller, Get, Post, Put, Delete, Res, Req, Body, Param, Query } from '@nestjs/common';
import { users } from 'src/models/users.models';
import { RedisService } from 'src/redis/redis.service';
import { Users } from 'src/users/DTO/users.dto';
@Controller('verify')
export class VerifyController {
    constructor(private readonly redis: RedisService) { }
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
                Logger.debug(null)
                message = "failed"
            }

            return ({ message: message })
        } catch (err) {
            console.error(err.message);
        }
    }
}
