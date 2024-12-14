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
import { ObjectMd5Hasher } from './objectMd5Hasher';
import { IObjectHasher } from './hash-object.interface';
import { PostEvent } from './entities/post-event.entity';
import { EventTypeEnum } from './enums/event-type.enum';

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
    return created;
  }

  private hashPost(title, content) {
    return this.hashProvider.makeHash({ title, content });
  }

  private createEvent(post: Post, eventType: EventTypeEnum) {
    switch (eventType) {
      case EventTypeEnum.POST_REMOVED:
        return new PostEvent({
          timestamp: post.updated_at,
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
          },
        });
    }
  }

  findAll() {
    return `This action returns all posts`;
  }

  findOne(id: string) {
    return this.postsRepository.findOneOrFail({ where: { id } });
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: string) {
    return `This action removes a #${id} post`;
  }

  handleErrors(err) {
    if (err.constraint == 'UniquePostTitleConstraint') {
      throw new ConflictException({
        message: 'title must be unique',
        service: 'Posts',
        status: HttpStatus.CONFLICT,
      });
    }
  }
}
