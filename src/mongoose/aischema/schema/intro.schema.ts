
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { HydratedDocument } from 'mongoose';
export type IntroDocument = HydratedDocument<Intro>;

@Schema()
export class Intro {
    @Prop({ required: true, type: String })
    userID: string

    @Prop({ required: false, type: Date, default: new Date().toISOString() })
    prePublishTime: Date

    @Prop({ required: true, type: Boolean, default: false })
    publish: boolean

    @Prop({ requried: true, type: String, default: randomUUID() })
    uuid: string

    @Prop({ required: true, type: String })
    AuditID: string

    @Prop({ required: false, type: String, default: null })
    description: string
}

export const IntroSchema = SchemaFactory.createForClass(Intro);
