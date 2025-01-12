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
        publish: number, commentAllow: number,
        title: string, description: string,
        url: string): Promise<any> {
        try {
            await this.introAsk.updateMany({
                uuid: uuid,
            }, {
                $set: {
                    title: title,
                    description: description,
                    publish: publish,
                    commentAllow: commentAllow,
                    url: url
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
            }).select("-_id -__v -userID ").exec()
            return find === null ? false : find
        } catch (err) {
            console.error(err.message);
        }
    }

    async findAllByUUID(userID: string, limit: number): Promise<any> {
        try {
            const find = await this.introAsk.find({
                userID: userID, publish: 1
            }).select("-_id -userID").limit(limit).exec()
            return find
        } catch (err) {
            console.error(err.message);
        }
    }

    async findUrlName(urlName: string): Promise<any> {
        try {
            const find = await this.introAsk.findOne({
                url: urlName
            }).exec()

            if (find.url) {
                return true
            } else {
                return false
            }
        } catch (err) {
            console.error(err.message);
        }
    }
}

