import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Intro, IntroDocument } from './schema/intro.schema';
import { Model } from 'mongoose';
import { TimeService } from 'src/time/time.service';
@Injectable()
export class AischemaService {
    constructor(@InjectModel(Intro.name) private introAsk: Model<IntroDocument>,
        private readonly timeServ: TimeService) { }
    async checkUser(userID: number): Promise<any> {
        try {
            const find = await this.introAsk.findOne({ userID: userID }).exec()
            return find
        } catch (err) {
            console.error(err.message);
        }
    }

    async registUser(userID: number, fullName: string, activityIntens: number, age: number, weight: number, tal: number): Promise<any> {
        try {
            const find = await this.checkUser(userID)

            if (!find) {
                await this.introAsk.create({
                    userID: userID, fullName: fullName, activityIntens: activityIntens, age: age,
                    weight: weight, tal: tal, timestamp: await this.timeServ.localeString()
                })
                return true
            } else {
                return false
            }
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
            const find = await this.checkUser(userID)
            if (find) {
                const deleted = await this.introAsk.deleteOne({ userID: userID })
                return deleted ? true : false
            } else {
                return false
            }
        } catch (err) {
            console.error(err.message);
        }
    }
}

