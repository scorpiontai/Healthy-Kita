import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type AuditDocument = HydratedDocument<Audit>;

@Schema()
export class Audit {
    //need  hash index
    @Prop({ required: true, type: String })
    userID: string

    @Prop({ required: true, type: String })
    UUID: string

    @Prop({ required: true, type: String })
    greeting: string

    @Prop({ required: true, type: String })
    problem: string

    @Prop({ required: true, type: String })
    physic: string

    @Prop({ required: true, type: String, default: new Date().toLocaleString() })
    date: string

    @Prop({ required: true, type: String })
    recommend: String
}

export const AuditSchema = SchemaFactory.createForClass(Audit);
