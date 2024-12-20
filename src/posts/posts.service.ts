import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { EntityManager, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { PostEvent } from './entities/post-event.entity';
import { EventTypeEnum } from './enums/event-type.enum';
import { IObjectHasher } from './hash/hash-object.interface';
import { ObjectMd5Hasher } from './hash/MD5-hash';
import { PostDto } from './dto/post.dto';
import { paginate, PaginateQuery } from 'nestjs-paginate';
import { PostPaginationConfig } from './entities/post-pagination.config';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name, {
    timestamp: true,
  });

  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @Inject(ObjectMd5Hasher) private hashProvider: IObjectHasher,
    @InjectEntityManager() private entityManager: EntityManager,
  ) {}

  async create(createPostDto: CreatePostDto) {
    try {
      const created = await this.entityManager.transaction(
        'SERIALIZABLE',
        async (manager) => {
          const post = new Post({
            ...createPostDto,
            hash: this.hashPost(createPostDto.title, createPostDto.content),
          });

          const created = await manager.save(post);

          const event = this.createEvent(created, EventTypeEnum.POST_CREATED);

          await manager.save(event);
          return created;
        },
      );
      return PostDto.fromPost(created);
    } catch (err) {
      this.handleErrors(err);
    }
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

  async findAll(query: PaginateQuery) {
    const paginated = await paginate(
      query,
      this.postsRepository,
      PostPaginationConfig,
    );
    paginated.data = paginated.data.map((post: Post) =>
      PostDto.fromPost(post),
    ) as any;
    return paginated;
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findOneOrFail({ where: { id } });
    return PostDto.fromPost(post);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      const updated = await this.entityManager.transaction(
        'SERIALIZABLE',
        async (manager) => {
          let post = await manager.findOneOrFail(Post, {
            where: { id },
            lock: { mode: 'pessimistic_read', onLocked: 'nowait' },
          });

          post = this.updatePost(post, updatePostDto);
          post = await manager.save(post);
          const event = this.createEvent(post, EventTypeEnum.POST_UPDATED);
          await manager.save(event);

          return post;
        },
      );
      return PostDto.fromPost(updated);
    } catch (err) {
      this.handleErrors(err);
    }
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
    try {
      const removed = await this.entityManager.transaction(
        'READ COMMITTED',
        async (manager) => {
          const post = await manager.findOneOrFail(Post, { where: { id } });
          // Create event before manager.remove sets id to undefined
          const event = this.createEvent(post, EventTypeEnum.POST_REMOVED);
          await manager.remove(post);
          await manager.save(event);
          return post;
        },
      );
      return PostDto.fromPost(removed);
    } catch (err) {
      this.handleErrors(err);
    }
  }

  private handleErrors(err) {
    this.logger.error(err);
    if (err.constraint == 'UniquePostTitleConstraint') {
      throw new ConflictException({
        message: 'title must be unique',
        service: 'posts',
        status: HttpStatus.CONFLICT,
      });
    } else if (err.constraint == 'ContentLengthCheck') {
      throw new BadRequestException({
        message: 'Incorrect content length',
        service: 'posts',
        status: HttpStatus.BAD_REQUEST,
      });
    } else if (err.constraint == 'TitleLengthCheck') {
      throw new BadRequestException({
        message: 'Incorrect title length',
        service: 'posts',
        status: HttpStatus.BAD_REQUEST,
      });
    } else {
      throw err;
    }
  }

  private hashPost(title, content) {
    return this.hashProvider.makeHash({ title, content });
  }
}
