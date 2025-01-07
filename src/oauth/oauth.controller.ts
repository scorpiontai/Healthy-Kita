import { Controller, UseGuards, Get, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { users } from 'src/models/users.models';
import axios from 'axios'
import { RedisService } from 'src/redis/redis.service';
import { EncService } from 'src/enc/enc.service';
import { Response } from 'express'

@Controller('oauth')
export class OauthController {
    constructor(
        private readonly redis: RedisService,
        private readonly enc: EncService,
    ) { }

    @Get("google")
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req): Promise<any> {
        try {
        } catch (err) {
            console.error(err.message);
        }
    }

    async HandlingIfAlreadyHaveToken(token: string): Promise<any> {
        try {
            const endpointVerify = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`


            const areVerify = await axios.get(endpointVerify)
            return areVerify.data.verified_email
        } catch (err) {
            console.error(err.message);
        }
    }

    @Get("google/callback")
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: Response): Promise<any> {
        try {
            let { accessToken, firstName, lastName, email, picture } = req.user
            const find = await this.redis.get(`token:${email}`)

            lastName = lastName.replace(/\s+/g, '_').toLowerCase()
            if (!find) {
                const find = await users.findOne({
                    where: {
                        email: email,
                        encInfo: 1,
                    }, attributes: ['ID']
                })

                if (!find) {

                    await users.create({
                        fullName: `${firstName} ${lastName}`,
                        username: `${lastName}_${new Date().valueOf()}`,
                        email: email,
                        pictures: picture,
                        encInfo: 1
                    })

                    let getKey = await this.enc.set()
                    const { key, iv } = getKey


                    await this.redis.lockForAccses(email, accessToken)
                    return res.status(200).json({ status: 200, encKey: key, ivKey: iv })
                } else {
                    const token = await this.redis.get(`token:${email}`)
                    const verify = await this.HandlingIfAlreadyHaveToken(token)
                    return verify ? res.status(200).json({ status: 200 }) : res.status(500).json({ staus: 500 })
                }
            } else {
                const token = await this.redis.get(`token:${email}`)
                const verify = await this.HandlingIfAlreadyHaveToken(token)
                return verify ? res.status(200).json({ status: 200 }) : res.status(500).json({ staus: 500 })
            }
        } catch (err) {
            console.error(err.message);
        }
    }
}

