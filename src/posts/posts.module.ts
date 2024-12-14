import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { ObjectMd5Hasher } from './objectMd5Hasher';

@Module({
  controllers: [PostsController],
  providers: [PostsService, ObjectMd5Hasher],
  imports: [TypeOrmModule.forFeature([Post])],
})
export class PostsModule {}
