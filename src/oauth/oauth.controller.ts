import { Controller, UseGuards, Get, Post, Req, Res, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { users } from 'src/models/users.models';

@Controller('oauth')
export class OauthController {


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

            let message
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
                message = `akun ${fullName} berhasil dibuat`
                res.setHeader("token", accessToken)
            } else {
                res.status(409).json({ message: "harap masukkan username, username akun google kamu sudah terpakai" })
            }
            return res.status(200).json({ message: message })
        } catch (err) {
            console.error(err.message);
        }
    }
}

