import { Controller, UseGuards, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { users } from 'src/models/users.models';
import axios from 'axios'
import { RedisService } from 'src/redis/redis.service';
import { EncService } from 'src/enc/enc.service';
import { Response, Request } from 'express'

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
            const areVerify: any = await axios.get(endpointVerify)

            if (areVerify) {
                const userID = await users.findOne({
                    where: {
                        email: areVerify.data.email
                    },
                    attributes: ['ID']
                })
                return {
                    status: areVerify.data.verified_email,
                    emailUser: areVerify.data.email,
                    ID: userID.ID
                }
            } else {
                return false
            }
        } catch (err) {
            console.error(err.message);
        }
    }
    @Get("google/callback")
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: Response): Promise<any> {
        try {
            let { accessToken, firstName, lastName, email, picture } = req.user;

            lastName = lastName.replace(/\s+/g, '_').toLowerCase();

            const findByDB = await users.findOne({
                where: {
                    email: email,
                    encInfo: 1,
                },
                attributes: ['ID']
            });

            if (!findByDB) {
                const username = `${lastName}_${new Date().valueOf()}`;

                await users.create({
                    fullName: `${firstName} ${lastName}`,
                    username: username,
                    email: email,
                    pictures: picture,
                    encInfo: 1,
                    verify: 1
                });

                const getKey = await this.enc.set();
                const { key, iv } = getKey;

                await this.redis.lockForAccses(email, accessToken)
                await users.update({
                    oauth: 1
                }, { where: { email: email } })

                axios.post(`http://localhost:6060/api/oauth/get/credentials`, {
                    encKey: key,
                    ivKey: iv
                },{
                    withCredentials: true
                })

                return res.redirect(`http://localhost:8080/home`)
            }

            const existingToken = await this.redis.get(`token:${email}`);
            if (existingToken) {
                const check = await this.HandlingIfAlreadyHaveToken(existingToken);
                if (check.status) {
                    await this.redis.lockForAccses(email, accessToken)
                    return res.redirect(`http://localhost:8080/home`)
                }
            } else {
                await this.redis.lockForAccses(email, accessToken)
                return res.redirect(`http://localhost:8080/home`)
            }

        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
}