import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EntityNotFoundExceptionFilter } from './filters/entityNotFound.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Posts-app')
    .setDescription('Posts-api')
    .setVersion('0,1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new EntityNotFoundExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
