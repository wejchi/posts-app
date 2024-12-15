import { PostEventData } from '../entities/post-event-data';
import { PostEvent } from '../entities/post-event.entity';
import { EventTypeEnum } from '../enums/event-type.enum';

export class PostEventDto {
  id: number;

  type: EventTypeEnum;

  data: PostEventData;

  timestamp: Date;

  constructor(data: Partial<PostEventDto>) {
    Object.assign(this, data);
  }

  public static fromPostEvent(postEvent: PostEvent) {
    return new PostEventDto({
      id: postEvent.id,
      type: postEvent.type,
      data: postEvent.data,
      timestamp: postEvent.timestamp,
    });
  }
}
