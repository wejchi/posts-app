import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StateEnum } from '../enums/state.enum';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ type: String, minLength: 3, maxLength: 100 })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ type: String, minLength: 3 })
  @IsString()
  @MinLength(3)
  content: string;

  @ApiPropertyOptional({ enum: StateEnum, default: StateEnum.DRAFT })
  @IsOptional()
  @IsEnum(StateEnum)
  state?: StateEnum = StateEnum.DRAFT;
}
