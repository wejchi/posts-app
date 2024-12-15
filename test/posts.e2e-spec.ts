import request from 'supertest';
import { config } from './e2e-tests-config';
import { CreatePostDto } from 'src/posts/dto/create-post.dto';
import { faker } from '@faker-js/faker';
import { StateEnum } from 'src/posts/enums/state.enum';
import { UpdatePostDto } from 'src/posts/dto/update-post.dto';

const BASE_URL = config.address;

describe('Posts (e2e)', () => {
  it('should create, update and remove post', async () => {
    const createDto: CreatePostDto = {
      title: faker.string.alphanumeric({ length: { min: 3, max: 100 } }),
      content: faker.string.alphanumeric({ length: { min: 3, max: 100 } }),
      state: StateEnum.DRAFT,
    };

    const createdPost = (
      await request(BASE_URL).post('/posts').send(createDto).expect(201)
    ).body;
    expect(createdPost).toMatchObject(createDto);

    const getResult = (
      await request(BASE_URL).get(`/posts/${createdPost.id}`).expect(200)
    ).body;

    expect(getResult).toEqual(createdPost);

    const updatePostDto: UpdatePostDto = {
      title: faker.string.alphanumeric({ length: { min: 3, max: 100 } }),
      content: faker.string.alphanumeric({ length: { min: 3, max: 100 } }),
      state: StateEnum.PUBLISHED,
    };

    const updatedPost = (
      await request(BASE_URL)
        .patch(`/posts/${createdPost.id}`)
        .send(updatePostDto)
        .expect(200)
    ).body;
    expect(updatedPost).toMatchObject(updatePostDto);

    const paginationResult = (
      await request(BASE_URL)
        .get('/posts')
        .query({ search: updatePostDto.title })
        .expect(200)
    ).body;
    expect(paginationResult.data[0]).toEqual(updatedPost);

    await request(BASE_URL).delete(`/posts/${createdPost.id}`).expect(200);
    await request(BASE_URL).delete(`/posts/${createdPost.id}`).expect(404);
    await request(BASE_URL).get(`/posts/${createdPost.id}`).expect(404);
    await request(BASE_URL)
      .patch(`/posts/${createdPost.id}`)
      .send(updatePostDto)
      .expect(404);
  });
});
