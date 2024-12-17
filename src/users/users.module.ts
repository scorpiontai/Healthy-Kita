import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { users } from 'src/models/users.models';
import { UsersService } from './users.service';
import * as dotenv from 'dotenv';
import {resolve} from 'path'
dotenv.config({ path: resolve('./src/.env') });

console.debug( process.env.MYSQL_HOST, process.env.MYSQL_PORT)
@Module({
    imports: [SequelizeModule.forRoot({
        dialect: 'mysql',
        host: process.env.MYSQL_HOST,
        port: +process.env.MYSQL_PORT,
        username: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB,
        autoLoadModels: true,
        synchronize: true,
        logging:true
    }),
    SequelizeModule.forFeature([users])],
})
export class UsersModule { }
