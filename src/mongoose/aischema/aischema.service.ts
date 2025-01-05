import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Intro, IntroDocument } from './schema/intro.schema';
import { Model } from 'mongoose';
import { TimeService } from 'src/time/time.service';
import { RedisService } from 'src/redis/redis.service';
@Injectable()
export class AischemaService {
    constructor(@InjectModel(Intro.name) private introAsk: Model<IntroDocument>,
        private readonly timeServ: TimeService,
        private readonly redisServ: RedisService) { }

    async registByDefault(userID: any, content: string): Promise<any> {
        try {
            await this.introAsk.create({
                userID: userID,
                content: content
            })
            return true
        } catch (err) {
            console.error(err.message);
        }
    }

    //this func for public true and added external description
    async addExternalInfo(userID: string,
        description: string, publish: boolean): Promise<any> {
        try {
            await this.introAsk.updateMany({
                userID: userID
            }, {
                $set: {
                    description: description,
                    publish: publish
                }
            })
            return true
        } catch (err) {
            console.error(err.message);
            return false
        }
    }
}

