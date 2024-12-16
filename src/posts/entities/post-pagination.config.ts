import { FilterOperator, FilterSuffix, PaginateConfig } from 'nestjs-paginate';
import { Post } from './post.entity';

export const PostPaginationConfig: PaginateConfig<Post> = {
  sortableColumns: ['id'],
  filterableColumns: {
    state: [FilterOperator.IN, FilterSuffix.NOT, FilterOperator.EQ],
  },
  searchableColumns: ['title', 'content'],
};
