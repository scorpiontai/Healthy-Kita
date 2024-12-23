import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs'
import { AskCommand } from 'src/ask/ask.command';
import { AskQuery } from 'src/ask/ask.query';
import { MongooseModule } from '@nestjs/mongoose';
import { Intro, IntroSchema } from 'src/mongoose/aischema/schema/intro.schema';
import { Connection } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from 'src/kafka/kafka.service';
@Module({
    imports: [CqrsModule, MongooseModule.forRoot(process.env.MONGOD_HOST, {
        onConnectionCreate: (connection: Connection) => {
            connection.on('connected', () => console.log('connected'))
        }
    }),
        MongooseModule.forFeature([{ name: Intro.name, schema: IntroSchema }]),
    ],
    providers: [AskCommand, AskQuery]
})
export class AiModule { }
