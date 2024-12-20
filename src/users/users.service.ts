
import { Injectable, Logger } from '@nestjs/common';
import { users } from 'src/models/users.models';
import * as argon2 from 'argon2'
import { RandomcodeService } from 'src/randomcode/randomcode.service';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { RedisService } from 'src/redis/redis.service';
import { randomString } from 'random-string';
import { randomUUID } from 'crypto';
@Injectable()
export class UsersService {
    constructor(private readonly randomCode: RandomcodeService,
        private readonly mailserv: NodemailerService,
        private readonly redis: RedisService
    ) { }
    async signup(username: string, password: string, email: string): Promise<any> {
        try {
            if (!username && !password && !email)
                return "harap masukkan semua inputan"


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
                    password: await argon2.hash(password),
                    email: email
                })
            await this.sendVerifyMessage(email) //send verify
            return `sukses untuk membuat akun bernama ${username}, kami telah mengirimlan link verifikasi ke email ${email}`
        } catch (err) {
            console.error(err.message);
        }
    }

    async sendVerifyMessage(target: string): Promise<any> {
        try {
            const randomCoded = await this.randomCode.generateRandom()
            await this.redis.setWithTTL(`${target}:verifyCode`, randomCoded, 5 * 6000)
            await this.mailserv.sendMessage(target, `verifikasi`, `verifikasi link`, `http://localhost:3000/verify/email?code=${randomCoded}&email=${target}`)
            return `sukses mengirim kode verifikasi`
        } catch (err) {
            console.error(err.message);
        }
    }

    async login(username: string, password: string): Promise<any> {
        try {

            if (!username && !password)
                return "harap masukkan semua inputan"

            const find = await users.findOne({
                where: {
                    username: username,
                    verify: 1,
                }, raw: true
            })

            const verif = await argon2.verify(find.password, password)
            if (find && verif) {
                return true
            } else {
                return false
            }

        } catch (err) {
            console.error(err.message);
        }
    }

    async randomUserName(originName: string): Promise<any> { //random user name 
        try {
            let randomFour: any = randomUUID()
            let randomFourLength: any = Math.floor(randomFour.length / 2)
            const fullName = `${originName}_${randomFourLength}`
            return fullName
        } catch (err) {
            console.error(err.message);
        }
    }
}
