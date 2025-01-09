import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { resolve } from 'path'
import * as dotenv from 'dotenv';
import { RedisService } from 'src/redis/redis.service';
import { users } from 'src/models/users.models';
import { OauthController } from 'src/oauth/oauth.controller';
dotenv.config({ path: resolve('./src/.env') });
@Injectable()
export class Oauth2Service extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly redisServ: RedisService,
        private readonly oauth: OauthController
    ) {
        super({
            clientID: process.env.GOOGLE_clientID,
            clientSecret: process.env.GOOGLE_secreetID,
            callbackURL: 'http://localhost:6060/oauth/google/callback',
            scope: ['email', 'profile'],
            accesType: 'offline'
        })
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        try {
            const { name, emails, photos } = profile

            const user = {
                email: emails[0].value,
                firstName: name.givenName,
                lastName: name.familyName,
                picture: photos[0].value,
                accessToken,
                refreshToken
            }
            const getToken =
                await this.redisServ.get(`token:${user.email}`)

            if (getToken) {
                const find = await users.findOne({
                    where: {
                        email: user.email
                    }, attributes: ['oauth'], raw: true
                })
                const verif = await this.oauth.HandlingIfAlreadyHaveToken(
                    getToken
                )

                done(null, { next: true })
            } else {
                done(null, user)
            }

        } catch (err) {
            console.error(err.message);
        }
    }
}
