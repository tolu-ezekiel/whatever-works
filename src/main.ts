import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const config = new DocumentBuilder()
    .addSecurity('basic', {
      type: 'http',
      scheme: 'bearer',
    })
    .setTitle('Whatever.works API')
    .setDescription('User management API description')
    .setVersion('1.0')
    .addTag('user management')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`\u{1F389} Application is running on: ${await app.getUrl()}`);
}
bootstrap();
