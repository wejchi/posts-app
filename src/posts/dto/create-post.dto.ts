import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StateEnum } from '../enums/state.enum';

export class CreatePostDto {
  @ApiProperty({ type: String, minLength: 3, maxLength: 100 })
  title: string;

  @ApiProperty({ type: String, minLength: 3 })
  content: string;

  @ApiPropertyOptional({ enum: StateEnum, default: StateEnum.DRAFT })
  state: StateEnum = StateEnum.DRAFT;
}
