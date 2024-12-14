import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { EntityManager, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { ObjectMd5Hasher } from './objectMd5Hasher';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { StateEnum } from './enums/state.enum';
import { PostEvent } from './entities/post-event.entity';
import { EventTypeEnum } from './enums/event-type.enum';

describe('PostsService', () => {
  let service: PostsService;
  let postRepo: Repository<Post>;
  let entityManagerMock: Partial<EntityManager>;
  let hashProvider;

  beforeEach(async () => {
    entityManagerMock = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: { findOneOrFail: jest.fn() },
        },
        {
          provide: ObjectMd5Hasher,
          useValue: {
            makeHash: jest.fn().mockImplementation((x) => 'abc'),
          },
        },
        { provide: EntityManager, useValue: entityManagerMock },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepo = module.get(getRepositoryToken(Post));
    hashProvider = module.get(ObjectMd5Hasher);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call findOneOrFail with id', () => {
    const id = crypto.randomUUID();
    const repoSpy = jest.spyOn(postRepo, 'findOneOrFail');
    service.findOne(id);
    expect(repoSpy).toHaveBeenCalledWith({ where: { id } });
  });

  it('should save post and event', async () => {
    const createDto: CreatePostDto = {
      title: 'title',
      content: 'content',
      state: StateEnum.DRAFT,
    };

    const hashMakerSpy = jest.spyOn(hashProvider, 'makeHash');
    const date = new Date();
    const postId = crypto.randomUUID();
    const transactionalManagerMock = {
      save: jest.fn((x) => {
        if (x instanceof Post) {
          return new Post({
            ...x,
            created_at: date,
            updated_at: date,
            id: postId,
          });
        }
      }),
    } as any;

    const transactionSpy = jest
      .spyOn(entityManagerMock, 'transaction')
      .mockImplementation(async (s, x) => {
        await x(transactionalManagerMock as any);
      });

    await service.create(createDto);
    expect(transactionSpy).toHaveBeenCalled();
    expect(transactionalManagerMock.save).toHaveBeenNthCalledWith(
      1,
      new Post({
        title: createDto.title,
        content: createDto.content,
        hash: 'abc',
        state: StateEnum.DRAFT,
      }),
    );
    expect(transactionalManagerMock.save).toHaveBeenNthCalledWith(
      2,
      new PostEvent({
        sent: false,
        timestamp: date,
        type: EventTypeEnum.POST_CREATED,
        data: {
          id: postId,
          title: createDto.title,
          content: createDto.content,
        },
      }),
    );
    expect(transactionalManagerMock.save).toHaveBeenCalledTimes(2);
  });
});
