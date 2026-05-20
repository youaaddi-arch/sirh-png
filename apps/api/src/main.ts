import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.use(helmet());
  app.enableCors({ origin: config.get('CORS_ORIGIN', 'http://localhost:3000'), credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));

  // OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SIRH Paris Nord — API')
    .setDescription('API back-end multi-tenant (référence Eurecia)')
    .setVersion('2.0.0-sprint0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, doc);

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);
  logger.log(`🚀 SIRH API ready on http://localhost:${port}/api`);
  logger.log(`📚 Swagger UI on http://localhost:${port}/docs`);
}
bootstrap();
