import { Controller, UseGuards, Get, Post, Req, Res, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

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
            const { accessToken } = req.user

            if (!accessToken)
                return res.status(400).json({ message: "token tidak ditemukan, harap coba ulangi atau hubungi developer" })

            res.setHeader("token", accessToken)
            return res.status(200).json({ message: "success sign" })
        } catch (err) {
            console.error(err.message);
        }
    }
}

