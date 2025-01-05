import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Intro, IntroDocument } from './schema/intro.schema';
import { Model } from 'mongoose';
import { TimeService } from 'src/time/time.service';
import { RedisService } from 'src/redis/redis.service';
@Injectable()
export class AischemaService {
    constructor(@InjectModel(Intro.name) private introAsk: Model<IntroDocument>) { }

    async registByDefault(userID: any, prePublishTime: any): Promise<any> {
        try {
            await this.introAsk.create({
                userID: userID,
                prePublishTime: prePublishTime
            })
            return true
        } catch (err) {
            console.error(err.message);
        }
    }

    async findByUUID(uuid: string, userID?: string): Promise<any> {
        try {
            if (userID) {
                const findWithUID = await this.introAsk.findOne({
                    uuid: uuid,
                    userID: userID
                })
                //on debugging
                console.debug(findWithUID)
                return findWithUID
            } else {
                const find = await this.introAsk.find({
                    uuid: uuid
                })
                console.debug(find)
                return find
            }


        } catch (err) {
            console.error(err.message);
        }
    }


    async allFindWithUserID(userID: string): Promise<any> {
        try {
            const find = await this.introAsk.find({ userID: userID }).exec()
            return find
        } catch (err) {
            console.error(err.message);
        }
    }

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

