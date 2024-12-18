import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {resolve} from 'path'
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',  // Mengizinkan semua domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Metode yang diizinkan
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],  // Header yang diizinkan
  });
  await app.listen(3000);
}
bootstrap();
