
import { Injectable } from '@nestjs/common';
import { Users } from 'src/models/users.models';
import * as argon2 from 'argon2'

@Injectable()
export class UsersService {

    async signup(username: string, password: string, email: string): Promise<any> {
        try {
            const hashPw = await argon2.hash(password)

            const find = await Users.findOne({
                where: {
                    username: username
                }, raw: true
            })

            if (find !== undefined && find !== null) {
                await Users.create({
                    username: username,
                    password: password,
                    email: email
                })
                return `sukses untuk membuat akun bernama ${username}`
            } else {
                return `sudah ada username beranam ${username}`

            }

        } catch (err) {
            console.error(err.message);
        }
    }
}
