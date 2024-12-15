import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostEvent } from './entities/post-event.entity';
import { ObjectMd5Hasher } from './hash/objectMd5Hasher';
import { OutboxListenerService } from './outbox-listener.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [PostsController],
  providers: [PostsService, ObjectMd5Hasher, OutboxListenerService],
  imports: [
    TypeOrmModule.forFeature([Post, PostEvent]),
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
export class PostsModule {}
