import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';
import { Post } from './posts/entities/post.entity';
import { CreatePostsTable1734186231934 } from './migrations/1734186231934-migration';
import { PostEvent } from './posts/entities/post-event.entity';
import { CreatePostEvent1734206176401 } from './migrations/1734206176401-migration';

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
      migrations: [CreatePostsTable1734186231934, CreatePostEvent1734206176401],
      migrationsRun: true,
    }),
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
