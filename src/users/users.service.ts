
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

@Injectable()
export class UsersService {
    constructor(private readonly randomCode: RandomcodeService,
        private readonly mailserv: NodemailerService,
        private readonly redis: RedisService,
        private readonly task: TaskService,
        private readonly enc: EncService
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
                    password: await argon2.hash(password),
                    email: email
                })

            //set key and iv enc
            setTimeout(async () => {
                let encKey = await this.enc.set()
                encKey = JSON.stringify(encKey)
                await axios.get(`http://localhost:3000/oauth/encKey/get`, {
                    headers: {
                        'encKey': `${email}: ${encKey}`
                    }
                })
                return { message: true }
            }, 3000)


            await this.sendVerifyMessage(email) //send verify
            return `sukses untuk membuat akun bernama ${username}, kami telah mengirimlan link verifikasi ke email ${email}`

        } catch (err) {
            console.error(err.message);
        }
    }

    async sendVerifyMessage(target: string): Promise<any> {
        try {
            const randomCoded = await this.randomCode.generateRandom()
            const keyName = `${target}:verifyCode` // key name for redis key
            await this.redis.setWithTTL(keyName, randomCoded, 5 * 6000)
            //mail action 
            await this.mailserv.sendMessage(target, `verifikasi`, `verifikasi link`, `http://localhost:3000/verify/email?code=${randomCoded}&email=${target}`)
            this.task.scheduleDeleteFiveMinutes(keyName) //callback setTimeout to delete 
            return `sukses mengirim kode verifikasi`  //delete in 5 minutes
        } catch (err) {
            console.error(err.message);
        }
    }

    async login(username: string, password: string): Promise<any> {
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
