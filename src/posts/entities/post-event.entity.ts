import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EventTypeEnum } from '../enums/event-type.enum';
import { PostEventData } from '../post-event-data';

@Entity()
export class PostEvent {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ enum: EventTypeEnum, type: 'enum', nullable: false })
  type: EventTypeEnum;

  @Column({ type: 'json', nullable: false })
  data: PostEventData;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'bool', nullable: false, default: false })
  sent: boolean;

  constructor(data: Partial<PostEvent>) {
    Object.assign(this, data);
  }
}
