import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { users } from './models/users.models';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';
import { redisClientFactory } from './redisClient/redis.client';

@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [AppService, UsersService,redisClientFactory
  ],
})
export class AppModule { }
