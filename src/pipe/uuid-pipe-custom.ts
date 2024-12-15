import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class CustomParseUUIDPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!isUUID(value)) {
      throw new BadRequestException({
        message: `Invalid UUID provided for ${metadata.data}`,
        service: 'posts',
        status: 400,
      });
    }
    return value;
  }
}
