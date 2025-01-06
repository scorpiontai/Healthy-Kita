import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Intro, IntroDocument } from './schema/intro.schema';
import { Model } from 'mongoose';;
@Injectable()
export class AischemaService {
    constructor(@InjectModel(Intro.name) private introAsk: Model<IntroDocument>) { }


    async registByDefault(userID: any, uuid: string): Promise<any> {
        try {
            await this.introAsk.create({
                userID: userID,
                uuid: uuid
            })
            return true
        } catch (err) {
            console.error(err.message);
        }
    }



    async addExternalInfo(uuid: string,
        description: string, publish: number, commentAllow: number,
        url: string): Promise<any> {
        try {
            await this.introAsk.updateMany({
                uuid: uuid
            }, {
                $set: {
                    description: description,
                    publish: publish,
                    commentAllow: commentAllow
                }
            })
            return true
        } catch (err) {
            console.error(err.message);
            return false
        }
    }
}

