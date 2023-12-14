import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Server } from 'hyper-express';

import { HyperExpressAdapter } from './adapter/HyperExpressAdapter';
import { AppModule } from './AppModule';

async function bootstrap(): Promise<void> {
  const app: INestApplication<unknown> = await NestFactory.create<any>(
    AppModule,
    new HyperExpressAdapter(new Server()),
    {},
  );

  app.enableShutdownHooks();

  await app.listen(3000, '0.0.0.0');
}

void bootstrap();
