import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/entities/post.entity';
import { CreatePostsTable1734186231934 } from './migrations/1734186231934-migration';
import { PostEvent } from './posts/entities/post-event.entity';
import { CreatePostEvent1734206176401 } from './migrations/1734206176401-migration';
import { SetupNotification1734267138221 } from './migrations/1734267138221-migration';
import { NatsListenerModule } from './nats-listener/nats-listener.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [Post, PostEvent],
      migrations: [
        CreatePostsTable1734186231934,
        CreatePostEvent1734206176401,
        SetupNotification1734267138221,
      ],
      migrationsRun: true,
    }),
    PostsModule,
    NatsListenerModule,
  ],
})
export class AppModule {}
