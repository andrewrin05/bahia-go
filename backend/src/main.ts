import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = Number(process.env.PORT) || 8084; // use env or default to a port that does not clash with Expo
  await app.listen(port, '0.0.0.0');
}
bootstrap();