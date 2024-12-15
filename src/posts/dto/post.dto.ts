import { ApiProperty } from '@nestjs/swagger';
import { StateEnum } from '../enums/state.enum';

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
}
