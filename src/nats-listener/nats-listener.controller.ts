import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class NatsListenerCOntroller {
  @EventPattern('POST_EVENT')
  getDate(@Payload() data) {
    console.log(data);
    return 'ok';
  }
}
