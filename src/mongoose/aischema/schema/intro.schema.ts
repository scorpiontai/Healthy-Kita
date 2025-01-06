import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type IntroDocument = HydratedDocument<Intro>;

@Schema()
export class Intro {
    //hashed index
    @Prop({ required: true, type: String })
    userID: string

    //index partial by true
    @Prop({ required: true, type: Number, default: 1 })
    publish: number

    //index partial by true
    @Prop({ required: true, type: Number, default: 1 })
    commentAllow: number

    @Prop({ required: true, type: String })
    uuid: string



    @Prop({ required: false, type: Date, default: new Date().toLocaleString() })
    prePublishTime: Date

    @Prop({ required: false, type: String, default: null })
    description: string

    //hash index
    @Prop({ required: true, type: String })
    url: string
}

export const IntroSchema = SchemaFactory.createForClass(Intro);
