import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { EntityManager, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PostEvent } from './entities/post-event.entity';
import { EventTypeEnum } from './enums/event-type.enum';
import { IObjectHasher } from './hash/hash-object.interface';
import { ObjectMd5Hasher } from './hash/objectMd5Hasher';
import { PostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @Inject(ObjectMd5Hasher) private hashProvider: IObjectHasher,
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}

  async create(createPostDto: CreatePostDto) {
    let created;
    try {
      await this.entityManager.transaction('SERIALIZABLE', async (manager) => {
        const post = new Post({
          ...createPostDto,
          hash: this.hashPost(createPostDto.title, createPostDto.content),
        });

        created = await manager.save(post);

        const event = this.createEvent(created, EventTypeEnum.POST_CREATED);

        await manager.save(event);
      });
    } catch (err) {
      this.handleErrors(err);
    }
    return PostDto.fromPost(created);
  }

  private createEvent(post: Post, eventType: EventTypeEnum) {
    switch (eventType) {
      case EventTypeEnum.POST_REMOVED:
        return new PostEvent({
          timestamp: new Date(),
          type: eventType,
          sent: false,
          data: {
            id: post.id,
          },
        });
      default:
        return new PostEvent({
          timestamp: post.updated_at,
          type: eventType,
          sent: false,
          data: {
            id: post.id,
            content: post.content,
            title: post.title,
            state: post.state,
          },
        });
    }
  }

  findAll() {
    return `This action returns all posts`;
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findOneOrFail({ where: { id } });
    return PostDto.fromPost(post);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const updated = await this.entityManager.transaction(
      'SERIALIZABLE',
      async (manager) => {
        let post = await manager.findOneOrFail(Post, {
          where: { id },
          lock: { onLocked: 'skip_locked', mode: 'pessimistic_read' },
        });

        post = this.updatePost(post, updatePostDto);
        post = await manager.save(post);
        const event = this.createEvent(post, EventTypeEnum.POST_UPDATED);
        await manager.save(event);

        return post;
      },
    );
    return PostDto.fromPost(updated);
  }

  updatePost(post: Post, updateDto: UpdatePostDto) {
    if (
      (updateDto.title && updateDto.title !== post.title) ||
      (updateDto.content && updateDto.content)
    ) {
      post.hash = this.hashPost(
        updateDto.title || post.title,
        updateDto.content || post.content,
      );
    }

    Object.assign(post, updateDto);
    return post;
  }

  async remove(id: string) {
    const removed = await this.entityManager.transaction(
      'READ COMMITTED',
      async (manager) => {
        const post = await manager.findOneOrFail(Post, { where: { id } });
        await manager.remove(post);
        const event = this.createEvent(post, EventTypeEnum.POST_REMOVED);
        await manager.save(event);
        return post;
      },
    );
    return PostDto.fromPost(removed);
  }

  private handleErrors(err) {
    if (err.constraint == 'UniquePostTitleConstraint') {
      throw new ConflictException({
        message: 'title must be unique',
        service: 'posts',
        status: HttpStatus.CONFLICT,
      });
    }
  }

  private hashPost(title, content) {
    return this.hashProvider.makeHash({ title, content });
  }
}
