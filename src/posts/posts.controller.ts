import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { PostDto } from './dto/post.dto';
import { CustomParseUUIDPipe } from './uuid-pipe-custom';
import {
  ApiOkPaginatedResponse,
  ApiPaginationQuery,
  Paginate,
  PaginateQuery,
} from 'nestjs-paginate';
import { PostPaginationConfig } from './entities/post-pagination.config';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOkResponse({ type: PostDto })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @ApiOkPaginatedResponse(PostDto, PostPaginationConfig)
  @ApiPaginationQuery(PostPaginationConfig)
  findAll(@Paginate() query: PaginateQuery) {
    return this.postsService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: PostDto })
  findOne(@Param('id', CustomParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: PostDto })
  update(
    @Param('id', CustomParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: PostDto })
  remove(@Param('id', CustomParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }
}
