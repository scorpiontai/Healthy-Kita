import { Controller, UseGuards, Get, Post, Req, Res, Logger, Body, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { users } from 'src/models/users.models';
import { UsersService } from 'src/users/users.service';
import axios from 'axios'
import { RedisService } from 'src/redis/redis.service';
@Controller('oauth')
export class OauthController {
    constructor(private readonly users: UsersService,
        private readonly redis: RedisService
    ) { }

    @Get("google")
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req): Promise<any> {
        try {
        } catch (err) {
            console.error(err.message);
        }
    }

    async HandlingIfAlreadyHaveToken(email: string): Promise<any> {
        try {
            if (!email)
                console.error("terjadi kesalahan sistem")

            const findIfExistsToken = await this.redis.get(`${email}:accessToken`)
            if (findIfExistsToken) {
                const endpointVerify = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${findIfExistsToken}`


                const areVerify = await axios.get(endpointVerify)
                return areVerify.data.verified_email // return true or false
            } else {
                return false
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    @Get("google/callback")
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res): Promise<any> {
        try {
            const { accessToken, firstName, lastName, email, picture } = req.user


            //logic here 
            // https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=

            const findIfExistsToken = await this.HandlingIfAlreadyHaveToken(email)

            if (!findIfExistsToken) {
                if (!accessToken)
                    return res.status(400).json({ message: "token tidak ditemukan, harap coba ulangi atau hubungi developer" })

                //jika berhasil, maka buat akun
                const fullName = `${firstName} ${lastName}`
                const find = await users.findOne({ where: { username: fullName, email: email, password: "oauth" }, raw: true })

                if (find === undefined || find === null) {
                    await users.create({
                        username: fullName,
                        password: 'oauth',
                        email: email,
                        verify: 1
                    })

                    await this.redis.setWithTTL(`${email}:accessToken`, accessToken, 3600)
                } else {
                    //if acccount hass created, only set redis key store accessToken
                    await this.redis.setWithTTL(`${email}:accessToken`, accessToken, 3600)
                    findIfExistsToken // verify 
                }
                return res.status(200).json({ message: `akun berhasil dibuat` })
            } else {
                return res.status(301).json({ message: true })
            }
        } catch (err) {
            console.error(err.message);
        }
    }

}

