import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Intro, IntroDocument } from './schema/intro.schema';
import { Model } from 'mongoose';
@Injectable()
export class AischemaService {
    constructor(@InjectModel(Intro.name) private introAsk: Model<IntroDocument>) { }
    async checkUser(userID: number): Promise<any> {
        try {
            const find = await this.introAsk.findOne({ userID: userID }).exec()
            return find
        } catch (err) {
            console.error(err.message);
        }
    }

    async registUser(userID: number, username: string, question: string): Promise<any> {
        try {
            await this.introAsk.create({
                userID: userID, username: username, question: question
            })
            return true
        } catch (err) {
            console.error(err.message);
            return false
        }
    }
    async setRecommendedAction(recommendedAction: string, userID: number): Promise<any> {
        try {
            await this.introAsk.updateOne({ userID: userID }, { $set: { recommendedAction: recommendedAction } })
        } catch (err) {
            console.error(err.message);
        }
    }

    async shutDown(userID: number): Promise<any> {
        try {
            const deleted = await this.introAsk.deleteOne({ userID: userID })
            return deleted ? true : false
        } catch (err) {
            console.error(err.message);
        }
    }
}

