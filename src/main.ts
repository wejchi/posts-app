import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EntityNotFoundExceptionFilter } from './filters/entityNotFound.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    // add dtos validation and custom exceptions factory
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const formattedErrors = errors
          .map(
            (error) =>
              `${error.property}: [${Object.values(error.constraints).join(', ')}]`,
          )
          .join('. ');
        return new BadRequestException({
          status: 400,
          message: `Validation failed. ${formattedErrors}`,
          service: 'posts',
        });
      },
    }),
  );

  // create swagger docs
  const config = new DocumentBuilder()
    .setTitle('Posts-app')
    .setDescription('Posts-api')
    .setVersion('0,1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // filter EntiotyNotFoundException thrown by typeorm
  app.useGlobalFilters(new EntityNotFoundExceptionFilter());

  // add microservice to emit events via nats
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: [process.env.NATS_ADDRESS],
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
