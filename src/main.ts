import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { resolve } from 'path'
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
  });
  await app.listen(3000);
}
bootstrap();
