import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { Client } from 'pg';
import { PostEvent } from './entities/post-event.entity';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PostEventDto } from './dto/post-event-dto';

@Injectable()
export class OutboxListenerService implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @Inject('NATS_POSTS_EVENT') private clientNats: ClientProxy,
  ) {
    this.client = new Client({
      host: 'posts-database',
      port: 5432,
      user: 'posts-app',
      password: '30q=3N**mAc1B',
      database: 'posts-database',
    });
  }

  async onModuleInit() {
    await this.client.connect();
    await this.client.query('LISTEN outbox_channel');

    this.client.on('notification', async (msg) => {
      try {
        this.entityManager.transaction(async (manager) => {
          const eventId = msg.payload;
          const event = await manager.findOne(PostEvent, {
            where: { id: eventId },
            lock: { mode: 'pessimistic_write' },
          });
          if (event) {
            await lastValueFrom(
              this.clientNats.emit(
                'POST_EVENT',
                PostEventDto.fromPostEvent(event),
              ),
            );
            event.sent = true;
            await manager.save(event);
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}
