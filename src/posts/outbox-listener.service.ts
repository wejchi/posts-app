import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  Logger,
} from '@nestjs/common';
import { Client } from 'pg';
import { PostEvent } from './entities/post-event.entity';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PostEventDto } from './dto/post-event-dto';

@Injectable()
// It can be moved to a separate application
export class OutboxListenerService implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  private readonly logger = new Logger(OutboxListenerService.name, {
    timestamp: true,
  });

  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @Inject('NATS_POSTS_EVENT') private clientNats: ClientProxy,
  ) {
    this.client = new Client({
      host: process.env.POSTGRES_HOST,
      port: 5432,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });
  }

  async onModuleInit() {
    await this.client.connect();
    await this.client.query('LISTEN outbox_channel');
    // listen to notifications from postgres and emit events created by posts service
    this.client.on('notification', async (msg) => {
      try {
        this.entityManager.transaction(async (manager) => {
          const eventId = msg.payload;
          const event = await manager.findOne(PostEvent, {
            where: { id: eventId, sent: false },
            lock: { mode: 'pessimistic_write', onLocked: 'skip_locked' },
          });
          if (event) {
            await this.emitEvent(event);
            event.sent = true;
            await manager.save(event);
          }
        });
      } catch (err) {
        this.logger.error(err);
      }
    });

    //find and emit events created when no listener was listening
    await this.findAndSearchEvents();
  }

  async findAndSearchEvents() {
    let events = await this.findUnsentEvents();
    while (events.length) {
      const promises = events.map(async (event) => {
        try {
          await this.emitEvent(event);
          event.sent = true;
        } catch (err) {
          this.logger.error(err);
        }
      });
      await Promise.all(promises);
      await this.entityManager.save(events);
      events = await this.findUnsentEvents();
    }
  }

  private findUnsentEvents() {
    return this.entityManager.find(PostEvent, {
      where: { sent: false },
      order: { timestamp: 'ASC' },
      take: 100,
    });
  }

  private async emitEvent(event: PostEvent) {
    await lastValueFrom(
      this.clientNats.emit('POST_EVENT', PostEventDto.fromPostEvent(event)),
    );

    return event;
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}
