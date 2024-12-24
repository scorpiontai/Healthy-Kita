
import { Injectable, Logger } from '@nestjs/common';
import { users } from 'src/models/users.models';
import * as argon2 from 'argon2'
import { RandomcodeService } from 'src/randomcode/randomcode.service';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';
import { RedisService } from 'src/redis/redis.service';
import { randomString } from 'random-string';
import { randomUUID } from 'crypto';
import { Op } from 'sequelize';
import { TaskService } from 'src/task/task.service';
import { EncService } from 'src/enc/enc.service';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class BeforeInit {
    constructor(private readonly jwt: JwtService,
        private readonly randomCode: RandomcodeService,
        private readonly mailserv: NodemailerService,
        private readonly redis: RedisService,
        private readonly task: TaskService,
        private readonly enc: EncService,
    ) { }
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

    async areVerify(action: string,): Promise<any> {
        try {
            let find = action.includes("@") ? await users.findOne({
                where: {
                    email: action
                }
            }) : await users.findOne({
                where: {
                    username: action
                }
            })

            return find.verify === 1 ? true : false
        } catch (err) {
            console.error(err.message);
        }
    }
    async decodeToken(token: any): Promise<any> {
        try {
            if (await this.jwt.verifyAsync(token)) {
                token = await this.jwt.decode(token)
                let userName = token.userName
                return userName
            }

        } catch (err) {
            console.error(err.message);
        }
    }

}

@Injectable()
export class UsersService {
    constructor(private readonly jwt: JwtService,
        private readonly randomCode: RandomcodeService,
        private readonly mailserv: NodemailerService,
        private readonly redis: RedisService,
        private readonly task: TaskService,
        private readonly enc: EncService,
        private readonly BeforeInit: BeforeInit
    ) { }


    async signup(username: string, password: string, email: string): Promise<any> {
        try {
            if (!username && !password && !email)
                return "harap masukkan semua inputan"

            if (username.includes("@")) {
                return "jangan ada simbol @ saat menyertakan nama"
            }

            const find: any = await users.findOne({
                where: {
                    [Op.or]: {
                        fullName: username,
                        email: email
                    }
                }, raw: true
            })

            if (find !== undefined && find !== null)
                return `sudah ada akun terdaftar`
            else
                await users.create({
                    fullName: username,
                    username: username,
                    password: await argon2.hash(password),
                    email: email
                })

            //set key and iv enc
            //send header 

            let encKey = await this.enc.set()
            encKey = JSON.stringify(encKey)
            await axios.get(`http://localhost:3000/oauth/encKey/get`, {
                headers: {
                    'encKey': `${email}: ${encKey}`
                }
            })



            //send verify 
            await this.redis.setWithTTL(`${email}:verifyCode`, randomUUID(), 5 * 60 * 1000) //set key payload verify
            const PayloadGet = await this.redis.get(`${email}:verifyCode`) //get
            await this.mailserv.sendMessage(email, "verifikasi email", "benarkah ini anda?", `http://localhost:3000/verify/email/${PayloadGet}?email=${email}`) //send
            this.task.scheduleDeleteFiveMinutes(PayloadGet) //callback delete after 5 mins
            return `sukses untuk membuat akun bernama ${username}, kami telah mengirimlan link verifikasi ke email ${email}`

        } catch (err) {
            console.error(err.message);
        }
    }

    async login(username: string, password: string, remember: string): Promise<any> {
        try {

            if (!username && !password)
                return "harap masukkan semua inputan"

            let finding = username.includes("@") ? await users.findOne({
                where:
                {
                    email: username, verify: 1
                }, raw: true
            }) : await users.findOne({ where: { fullName: username, verify: 1 } })



            const verif = await argon2.verify(finding.password, password)

            if (finding && verif) {
                let token = this.jwt.sign({ userName: username })
                return { mesasge: true, token: token }
            } else {
                return { message: false }
            }

        } catch (err) {
            console.error(err.message);
        }
    }

    async recoveryPwSendToMail(email: string, token: any): Promise<any> {
        try {

            let userName = await this.BeforeInit.decodeToken(token)

            const findUsername = await users.findOne({
                where: {
                    fullName: userName
                }, raw: true
            })


            const allProcess = await Promise.all([
                await this.redis.setWithTTL(`recover:${email}`, randomUUID(), 5 * 60 * 1000),
                await this.mailserv.sendMessage(email, "pesan ini untuk anda", `klik disini untuk memulihkan email `,
                    `${process.env.MAIN_HOST}/verify/forgotPw/${email}?code=${await this.redis.get(`recover:${email}`)}` //start to send
                ), this.task.scheduleDeleteFiveMinutes(`recover:${email}`) //callback setTimeout to delete
                , `sukses mengirim ke ${email}`
            ]) //processed all operations

            if (findUsername.email === email) {
                await this.BeforeInit.areVerify(email) ?
                    allProcess
                    : "terjadi kesalahan, coba lagi nanti"
                return allProcess[3]
            } else {
                return `email tidak cocok dengan username ${userName}`
            }
        } catch (err) {
            console.error(err.message);
        }
    }
}
