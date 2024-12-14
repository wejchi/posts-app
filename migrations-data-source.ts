import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Post } from './src/posts/entities/post.entity';
import { PostEvent } from 'src/posts/entities/post-event.entity';

config({ path: '.migrations.env' });

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  schema: 'public',
  migrationsTransactionMode: 'each',
  entities: [Post, PostEvent],
  migrations: [],
});

export default dataSource;
