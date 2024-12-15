import { ApiProperty } from '@nestjs/swagger';
import { StateEnum } from '../enums/state.enum';
import { Post } from '../entities/post.entity';

export class PostDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  hash: string;

  @ApiProperty({ enum: StateEnum })
  state: StateEnum;

  constructor(data: PostDto) {
    Object.assign(this, data);
  }

  public static fromPost(post: Post) {
    return new PostDto({
      id: post.id,
      content: post.content,
      title: post.title,
      hash: post.hash,
      state: post.state,
    });
  }
}
