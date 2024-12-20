import { Controller, UseGuards, Get, Post, Req, Res, Logger, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { users } from 'src/models/users.models';
import { UsersService } from 'src/users/users.service';

@Controller('oauth')
export class OauthController {
    constructor(private readonly users: UsersService) { }

    @Get("google")
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req): Promise<any> {
        try {
            console.debug(req.user)
        } catch (err) {
            console.error(err.message);
        }
    }
    @Get("google/callback")
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res): Promise<any> {
        try {
            const { accessToken, name, lastName, email } = req.user

            if (!accessToken)
                return res.status(400).json({ message: "token tidak ditemukan, harap coba ulangi atau hubungi developer" })

            //jika berhasil, maka buat akun
            const fullName = `${name} ${lastName}`
            const find = await users.findOne({ where: { username: fullName }, raw: true })

            if (find === undefined || find === null) {
                await users.create({
                    username: fullName,
                    password: 'oauth',
                    email: email,
                    verify: 1
                })
                res.setHeader("token", accessToken)
            } else {

                const randomName = await this.users.randomUserName(name)
                console.debug("random name debug", randomName)
                /*
                await users.create({
                    username: randomName,
                    password: 'oauth',
                    email: email,
                    verify: 1
                })
                res.setHeader("token", accessToken)
                */
            }
            return res.status(200).json({ message: `akun ${fullName} berhasil dibuat` })
        } catch (err) {
            console.error(err.message);
        }
    }
}

