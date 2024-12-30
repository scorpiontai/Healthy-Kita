
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IntroDocument = HydratedDocument<Intro>;

@Schema()
export class Intro {

    @Prop({ required: true, type: Number })
    userID: number

    @Prop({ required: false, type: String })
    fullName: string

    @Prop({ required: false, type: String })
    question: string

    @Prop({ required: true, type: Number })
    activityIntens: true

    @Prop({ required: true, type: Number })
    age: number

    @Prop({ required: true, type: Number })
    weight: number

    @Prop({ required: true, type: Number })
    tal: number

    @Prop({ required: true, type: String })
    timestamp: string

    @Prop({ required: true, type: Boolean, default: false })
    cachingQuestion: boolean
}

export const IntroSchema = SchemaFactory.createForClass(Intro);
