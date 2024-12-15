import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { EntityManager, Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { StateEnum } from './enums/state.enum';
import { PostEvent } from './entities/post-event.entity';
import { EventTypeEnum } from './enums/event-type.enum';
import { ObjectMd5Hasher } from './hash/objectMd5Hasher';
import { UpdatePostDto } from './dto/update-post.dto';

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
            makeHash: jest.fn().mockImplementation((x) => x.title + x.content),
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
      title: 'post title',
      content: 'post content',
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
        return x(transactionalManagerMock as any);
      });

    await service.create(createDto);
    expect(hashMakerSpy).toHaveBeenCalledWith({
      title: createDto.title,
      content: createDto.content,
    });
    expect(transactionSpy).toHaveBeenCalled();
    expect(transactionalManagerMock.save).toHaveBeenNthCalledWith(
      1,
      new Post({
        title: createDto.title,
        content: createDto.content,
        hash: createDto.title + createDto.content,
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
          state: createDto.state,
        },
      }),
    );
    expect(transactionalManagerMock.save).toHaveBeenCalledTimes(2);
  });

  it('should update post create event', async () => {
    const creationDate = new Date('2024-12-14T12:00:00');
    const orgUpdateDate = new Date('2024-12-14T13:00:00');
    const newUpdateDate = new Date();
    const transactionalManagerMock = {
      findOneOrFail: jest.fn((cls, x) => {
        return new Post({
          id: x.where.id,
          title: 'Post Title',
          content: 'Post Content',
          hash: 'old hash',
          state: StateEnum.DRAFT,
          created_at: creationDate,
          updated_at: orgUpdateDate,
        });
      }),
      save: jest.fn((x) => {
        if (x instanceof Post) {
          return new Post({
            ...x,
            updated_at: newUpdateDate,
          });
        }
      }),
    } as any;

    const transactionSpy = jest
      .spyOn(entityManagerMock, 'transaction')
      .mockImplementation(async (s, x) => {
        return x(transactionalManagerMock as any);
      });

    const updateDto: UpdatePostDto = {
      title: 'updated title',
      content: ' updated content',
      state: StateEnum.PUBLISHED,
    };

    const postId = crypto.randomUUID();
    const returned = await service.update(postId, updateDto);
    expect(transactionSpy).toHaveBeenCalledTimes(1);
    expect(transactionalManagerMock.findOneOrFail).toHaveBeenCalledWith(Post, {
      where: { id: postId },
      lock: { onLocked: 'skip_locked', mode: 'pessimistic_read' },
    });
    const expectedHash = updateDto.title + updateDto.content;

    expect(returned).toEqual(
      new Post({
        id: postId,
        ...updateDto,
        created_at: creationDate,
        updated_at: newUpdateDate,
        hash: expectedHash,
      }),
    );

    expect(transactionalManagerMock.save).toHaveBeenNthCalledWith(
      1,
      new Post({
        id: postId,
        ...updateDto,
        created_at: creationDate,
        updated_at: orgUpdateDate,
        hash: expectedHash,
      }),
    );

    expect(transactionalManagerMock.save).toHaveBeenNthCalledWith(
      2,
      new PostEvent({
        sent: false,
        timestamp: newUpdateDate,
        type: EventTypeEnum.POST_UPDATED,
        data: {
          id: postId,
          content: updateDto.content,
          title: updateDto.title,
          state: StateEnum.PUBLISHED,
        },
      }),
    );
  });

  it('should make no changes in post', () => {
    const postId = crypto.randomUUID();
    const post = new Post({
      id: postId,
      title: 'org title',
      content: 'org content',
      hash: 'org hash',
      state: StateEnum.DRAFT,
    });
    const updateDto = {};
    const updated = service.updatePost(post, updateDto);
    expect(updated).toEqual(
      new Post({
        id: postId,
        title: 'org title',
        content: 'org content',
        hash: 'org hash',
        state: StateEnum.DRAFT,
      }),
    );
  });

  it('should update title and hash', () => {
    const postId = crypto.randomUUID();
    const post = new Post({
      id: postId,
      title: 'org title',
      content: 'org content',
      hash: 'org hash',
      state: StateEnum.DRAFT,
    });
    const updateDto = { title: 'new title' };
    const updated = service.updatePost(post, updateDto);
    expect(updated).toEqual(
      new Post({
        id: postId,
        title: 'new title',
        content: 'org content',
        hash: 'new titleorg content',
        state: StateEnum.DRAFT,
      }),
    );
  });

  it('should update content and hash', () => {
    const postId = crypto.randomUUID();
    const post = new Post({
      id: postId,
      title: 'org title',
      content: 'org content',
      hash: 'org hash',
      state: StateEnum.DRAFT,
    });
    const updateDto = { content: 'new content' };
    const updated = service.updatePost(post, updateDto);
    expect(updated).toEqual(
      new Post({
        id: postId,
        title: 'org title',
        content: 'new content',
        hash: 'org titlenew content',
        state: StateEnum.DRAFT,
      }),
    );
  });

  it('should update title, content and hash', () => {
    const postId = crypto.randomUUID();
    const post = new Post({
      id: postId,
      title: 'org title',
      content: 'org content',
      hash: 'org hash',
      state: StateEnum.DRAFT,
    });
    const updateDto = { title: 'new title', content: 'new content' };
    const updated = service.updatePost(post, updateDto);
    expect(updated).toEqual(
      new Post({
        id: postId,
        title: 'new title',
        content: 'new content',
        hash: 'new titlenew content',
        state: StateEnum.DRAFT,
      }),
    );
  });

  it('should update only state', () => {
    const postId = crypto.randomUUID();
    const post = new Post({
      id: postId,
      title: 'org title',
      content: 'org content',
      hash: 'org hash',
      state: StateEnum.DRAFT,
    });
    const updateDto = { state: StateEnum.PUBLISHED };
    const updated = service.updatePost(post, updateDto);
    expect(updated).toEqual(
      new Post({
        id: postId,
        title: 'org title',
        content: 'org content',
        hash: 'org hash',
        state: StateEnum.PUBLISHED,
      }),
    );
  });

  it('should update title, content, state and hash', () => {
    const postId = crypto.randomUUID();
    const post = new Post({
      id: postId,
      title: 'org title',
      content: 'org content',
      hash: 'org hash',
      state: StateEnum.DRAFT,
    });
    const updateDto = {
      title: 'new title',
      content: 'new content',
      state: StateEnum.PUBLISHED,
    };
    const updated = service.updatePost(post, updateDto);
    expect(updated).toEqual(
      new Post({
        id: postId,
        title: 'new title',
        content: 'new content',
        hash: 'new titlenew content',
        state: StateEnum.PUBLISHED,
      }),
    );
  });

  it('should remove post and create event', async () => {
    const postId = crypto.randomUUID();
    const creationDate = new Date();
    const transactionalManagerMock = {
      findOneOrFail: jest.fn((cls, x) => {
        return new Post({
          id: x.where.id,
          title: 'Post Title',
          content: 'Post Content',
          hash: 'old hash',
          state: StateEnum.DRAFT,
          created_at: creationDate,
          updated_at: creationDate,
        });
      }),
      save: jest.fn((x) => {
        return x;
      }),
      remove: jest.fn((x) => x),
    } as any;

    const transactionSpy = jest
      .spyOn(entityManagerMock, 'transaction')
      .mockImplementation(async (s, x) => {
        return x(transactionalManagerMock as any);
      });

    await service.remove(postId);

    expect(transactionSpy).toHaveBeenCalledTimes(1);
    expect(transactionalManagerMock.findOneOrFail).toHaveBeenCalledWith(Post, {
      where: { id: postId },
    });

    expect(transactionalManagerMock.remove).toHaveBeenCalledWith(
      new Post({
        id: postId,
        title: 'Post Title',
        content: 'Post Content',
        hash: 'old hash',
        state: StateEnum.DRAFT,
        created_at: creationDate,
        updated_at: creationDate,
      }),
    );
    expect(transactionalManagerMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { id: postId },
        type: EventTypeEnum.POST_REMOVED,
      }),
    );
  });
});
