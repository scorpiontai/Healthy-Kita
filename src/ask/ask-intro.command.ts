import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { askCommandDTO } from './asjk.command-dto';
import { BeforeInit } from 'src/users/users.service';
import { EncService } from 'src/enc/enc.service';
import { CouchbBaseService } from 'src/couchbase/couchbase.service';
import { RedisService } from 'src/redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { users } from 'src/models/users.models';
import { profile } from 'console';
dotenv.config({ path: resolve('./src/.env') });


@CommandHandler(askCommandDTO)
export class AskCommand implements ICommandHandler<askCommandDTO> {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly encServ: EncService,
        private readonly redisServ: RedisService,
        private readonly BeforeInit: BeforeInit,
        private readonly couchbaseServ: CouchbBaseService
    ) { }


    async execute(command: askCommandDTO): Promise<any> {
        let { userID, encKey, ivKey } = command

        const profileInfo =
            await users.findOne({
                where: {
                    ID: userID
                }, raw: true
            })

        try {
            const find = await this.BeforeInit.findUsernameWithID(userID)
            let userIDEnc = await this.encServ.enc(encKey, ivKey, userID.toString())

            //get age         
            let age = new Date().getFullYear() - find.yearBorn

            if (!await this.redisServ.get(`start:${userIDEnc}`)) {
                await this.couchbaseServ.upset(userIDEnc, 'AI',
                    `question:${userIDEnc}`, null) //prepare cache store
            }

            //need lock info in db
            await this.redisServ.set(`start:${userID}`, 1)

            //need to store in mongodb 
            this.eventEmitter.emit("useAsk", {
                userIDEnc: userIDEnc,
                timestamp: new Date().toISOString(),
                fullName: profileInfo.fullName,
                age: new Date().getFullYear() - profileInfo.yearBorn,
                weight: profileInfo.weight,
                tall: profileInfo.tall,
                intensActivity: profileInfo.intensActivityWeek
            })

            let message = `tunggu sebentar...sistem akan menyiapkan semua ini`

            return { status: true, message: message, client: userIDEnc }

        } catch (error) {
            console.error(error.message)
        }
    }
}