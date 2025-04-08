export interface TemplateResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResult<T> {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  items: T[];
}
