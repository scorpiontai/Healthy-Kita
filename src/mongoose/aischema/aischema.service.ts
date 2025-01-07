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
                uuid: uuid,
                url: uuid
            })
            return true
        } catch (err) {
            console.error(err.message);
        }
    }



    async addExternalInfo(uuid: string,
        publish: number, commentAllow: number, description: string,
        url: string): Promise<any> {
        try {
            await this.introAsk.updateMany({
                uuid: uuid,
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


    async findOneByUUID(uuid: string): Promise<any> {
        try {
            const find = await this.introAsk.findOne({
                uuid: uuid
            }).select("-_id publish").exec()
            return find === null ? false : true
        } catch (err) {
            console.error(err.message);
        }
    }
}

