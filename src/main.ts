import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClientsModule, Transport, MicroserviceOptions } from '@nestjs/microservices';
import { resolve } from 'path'
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
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
  app.use(cookieParser)
  await app.listen(3000)
}
bootstrap();
