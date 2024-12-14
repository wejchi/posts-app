import {
  ConflictException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectMd5Hasher } from './objectMd5Hasher';
import { IObjectHasher } from './hash-object.interface';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
    @Inject(ObjectMd5Hasher) private hashProvider: IObjectHasher,
  ) {}

  async create(createPostDto: CreatePostDto) {
    let created;
    try {
      created = await this.postsRepository.save(
        new Post({
          ...createPostDto,
          hash: this.hashPost(createPostDto.title, createPostDto.content),
        }),
      );
    } catch (err) {
      this.handleErrors(err);
    }
    return created;
  }

  private hashPost(title, content) {
    return this.hashProvider.makeHash({ title, content });
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
