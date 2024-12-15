import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EntityNotFoundExceptionFilter } from './filters/entityNotFound.filter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
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

  const config = new DocumentBuilder()
    .setTitle('Posts-app')
    .setDescription('Posts-api')
    .setVersion('0,1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new EntityNotFoundExceptionFilter());

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
