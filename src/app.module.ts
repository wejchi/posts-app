import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/entities/post.entity';
import { PostEvent } from './posts/entities/post-event.entity';
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
      migrations: [],
      migrationsRun: true,
    }),
    PostsModule,
    NatsListenerModule,
  ],
})
export class AppModule {}
