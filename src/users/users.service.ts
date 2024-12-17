
import { Injectable, Logger } from '@nestjs/common';
import { users } from 'src/models/users.models';
import * as argon2 from 'argon2'

@Injectable()
export class UsersService {

    async signup(username: string, password: string, email: string): Promise<any> {
        try {

            const hashPw = await argon2.hash(password)

            const find = await users.findOne({
                where: {
                    username: username
                }, raw: true
            })

            if (find !== undefined && find !== null)
                return `sudah ada username beranam ${username}`
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
