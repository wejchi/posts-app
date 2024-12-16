import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NatsListenerCOntroller {
  private readonly logger = new Logger(NatsListenerCOntroller.name, {
    timestamp: true,
  });

  @EventPattern('POST_EVENT')
  getDate(@Payload() data) {
    this.logger.log('received event', data);
    return 'ok';
  }
}
