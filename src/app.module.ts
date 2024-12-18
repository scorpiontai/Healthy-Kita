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

@Module({
  imports: [UsersModule, RedisModule],
  controllers: [AppController, VerifyController],
  providers: [AppService, UsersService,redisClientFactory, NodemailerService, RedisService, RandomcodeService
  ],
})
export class AppModule { }
