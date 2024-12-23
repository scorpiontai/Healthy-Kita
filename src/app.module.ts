import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { users } from './models/users.models';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';
import { redisClientFactory } from './redisClient/redis.client';
import { NodemailerService } from './nodemailer/nodemailer.service';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { RandomcodeService } from './randomcode/randomcode.service';
import { VerifyController } from './verify/verify.controller';
import { JwtModule } from '@nestjs/jwt';
import { resolve } from 'path'
import { OauthController } from './oauth/oauth.controller';
import { Oauth2Service } from './oauth2/oauth2.service';
import { TaskService } from './task/task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AskCommand } from './ask/ask.command';
import { GeminiService } from './gemini/gemini.service';
import { EncService } from './enc/enc.service';
import { AiModule } from './ai/ai.module';
import { KafkaService } from './kafka/kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
dotenv.config({ path: resolve('./src/.env') });
@Module({
  imports: [UsersModule, RedisModule,
    ScheduleModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.SECREET_JWT,
      signOptions: { expiresIn: "10d" }
    }),
    ClientsModule.register([
      {
        name: 'useAskKafka',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'useAsk',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'useAskOneKafka-consumer'
          }
        }
      },
    ]),
  ],
  controllers: [AppController, VerifyController, OauthController],
  providers: [AppService, UsersService, redisClientFactory, NodemailerService, RedisService, RandomcodeService,
    Oauth2Service,
    TaskService,
    GeminiService,
    EncService,
    AiModule,
    KafkaService
  ],
})
export class AppModule { }
