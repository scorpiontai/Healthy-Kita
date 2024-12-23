
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IntroDocument = HydratedDocument<Intro>;

@Schema()
export class Intro {
    @Prop({ required: true, type: String })
    username: string;

    @Prop({ required: true, type: String })
    question: string;

    @Prop({ required: true, type: String })
    answer: string;

    @Prop({ required: false, type: String, default: null })
    recommendedAction: string
}

export const IntroSchema = SchemaFactory.createForClass(Intro);
