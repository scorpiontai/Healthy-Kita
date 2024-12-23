import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Intro } from './schema/intro.schema';
import { Model } from 'mongoose';
@Injectable()
export class AischemaService {
    constructor(@InjectModel(Intro.name, 'intro') private introAsk: Model<Intro>) { }

    async registUser(username: string, question: string, answer: string): Promise<any> {
        try {
            await this.introAsk.create(username, question, answer)
        } catch (err) {
            console.error(err.message);
        }
    }

    async recommendedUser(recommendedAction: string, username: string): Promise<any> {
        try {

        } catch (err) {
            console.error(err.message);
        }
    }
}

