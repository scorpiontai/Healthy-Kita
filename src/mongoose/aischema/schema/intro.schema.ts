
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IntroDocument = HydratedDocument<Intro>;

@Schema()
export class Intro {

    @Prop({ required: true, type: Number })
    userID: number

    @Prop({ required: false, type: String })
    username: string

    @Prop({ required: false, type: String })
    question: string

    @Prop({ required: false, type: String, default: null })
    recommendedAction: string
}

export const IntroSchema = SchemaFactory.createForClass(Intro);
