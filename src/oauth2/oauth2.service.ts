import { Injectable } from '@nestjs/common';
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { resolve } from 'path'
import * as dotenv from 'dotenv';
dotenv.config({ path: resolve('./src/.env') });
@Injectable()
export class Oauth2Service extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_clientID,
            clientSecret: process.env.GOOGLE_secreetID,
            callbackURL: 'http://localhost:3000/oauth/google/callback',
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
            done(null, user)
        } catch (err) {
            console.error(err.message);
        }
    }
}
