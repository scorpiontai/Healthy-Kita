
import { Injectable, Logger } from '@nestjs/common';
import { users } from 'src/models/users.models';
import * as argon2 from 'argon2'
import { RandomcodeService } from 'src/randomcode/randomcode.service';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UsersService {
    constructor(private readonly randomCode: RandomcodeService,
        private readonly mailserv: NodemailerService,
        private readonly redis: RedisService
    ) { }
    async signup(username: string, password: string, email: string): Promise<any> {
        try {

            const hashPw = await argon2.hash(password)

            const find = await users.findOne({
                where: {
                    username: username,
                    email: email
                }, raw: true
            })

            if (find !== undefined && find !== null)
                return `sudah ada username beranama ${username} atau email beralamat ${email}`
            else
                await users.create({
                    username: username,
                    password: password,
                    email: email
                })
            return `sukses untuk membuat akun bernama ${username}`
        } catch (err) {
            console.error(err.message);
        }
    }

    async sendVerifyMessage(target: string): Promise<any> {
        try {
            const randomCoded = await this.randomCode.generateRandom()
            await this.redis.setWithTTL(`${target}:verifyCode`, randomCoded, 5 * 6000)
            const redisVerify = await this.redis.get(`${target}:verifyCode`)
            await this.mailserv.sendMessage(target, `verifikasi`, `verifikasi link`, `<a href="http://localhost:4000/verify/email?code=${randomCoded}&email=${target}"`)
            return `sukses mengirim kode verifikasi`
        } catch (err) {
            console.error(err.message);
        }
    }

    async login(username: string, password: string): Promise<any> {
        try {
            const find = await users.findOne({
                where: {
                    username: username,
                    password: password
                }, raw: true
            })


            if (find.username.length > 0 && find.username.length > 0 && find.verify === 1)
                return true
            else
                return false

        } catch (err) {
            console.error(err.message);
        }
    }
}
