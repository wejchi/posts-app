import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NatsListenerCOntroller } from './nats-listener.controller';

@Module({
  controllers: [NatsListenerCOntroller],
  imports: [
    ClientsModule.register([
      {
        name: 'NATS_POSTS_EVENT',
        transport: Transport.NATS,
        options: {
          servers: [process.env.NATS_ADDRESS],
        },
      },
    ]),
  ],
})
export class NatsListenerModule {}
