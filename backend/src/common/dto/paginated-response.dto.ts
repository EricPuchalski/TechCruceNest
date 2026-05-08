export interface PaginatedResponseDto<TItem> {
  items: TItem[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
