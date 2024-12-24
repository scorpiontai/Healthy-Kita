import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClientsModule, Transport, MicroserviceOptions } from '@nestjs/microservices';
import { resolve } from 'path'
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser'
async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
    credentials:true
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'useAskOneKafka-consumer'
      }
    }

  });

  await app.startAllMicroservices()
  await app.listen(3000)
}
bootstrap();
