import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/entities/post.entity';
import { PostEvent } from './posts/entities/post-event.entity';
import { NatsListenerModule } from './nats-listener/nats-listener.module';
import { Migration1734358538617 } from './migrations/1734358538617-migration';
import { Migration1734358548943 } from './migrations/1734358548943-migration';

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
      migrations: [Migration1734358538617, Migration1734358548943],
      migrationsRun: true,
    }),
    PostsModule,
    NatsListenerModule,
  ],
})
export class AppModule {}
