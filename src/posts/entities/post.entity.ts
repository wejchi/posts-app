import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { StateEnum } from './state.enum';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, length: 100, type: 'varchar' })
  @Check(`LENGTH(title) BETWEEN 3 AND 100`)
  @Unique('UniquePostTitleConstraint', ['title'])
  title: string;

  @Column({ nullable: false, type: 'varchar' })
  @Check(`LENGTH(title) >= 3`)
  content: string;

  //- state: enum (the only strings allowed are: DRAFT, PUBLISHED) - provided by the user, optional (can be stored as a list or string; implementation details are flexible); default value - DRAFT
  // co znaczy can be stored as a list or string
  @Column({ type: 'enum', enum: StateEnum, default: StateEnum.DRAFT })
  state: StateEnum;

  @Column({ nullable: false })
  hash: string;

  // luxon datetime?
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
