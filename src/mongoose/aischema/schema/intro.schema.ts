
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { HydratedDocument } from 'mongoose';
export type IntroDocument = HydratedDocument<Intro>;

@Schema()
export class Intro {
    @Prop({ required: true, type: Number })
    userID: number

    @Prop({ required: true, type: String, default: randomUUID() })
    name: string

    @Prop({ required: true, type: String, default: new Date().toLocaleString() })
    time: string

    @Prop({ required: true, type: Boolean, default: false })
    publish: boolean

}

export const IntroSchema = SchemaFactory.createForClass(Intro);
