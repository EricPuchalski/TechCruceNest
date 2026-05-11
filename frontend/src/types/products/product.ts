export type SortBy =
  | 'name'
  | 'priceAsc'
  | 'priceDesc'
  | 'store'
  | 'createdAt'
  | 'updatedAt'
  | 'lastScrapedAt'

export interface PriceHistoryEntry {
  price: number
  currency: string
  date: string
}

export interface Product {
  id: string
  name: string
  price: number
  currency: string
  imageUrl: string | null
  productUrl: string
  store: string
  priceHistory: PriceHistoryEntry[]
  hasPriceDropped: boolean
  active: boolean
  lastScrapedAt: string
  lastActivationDate?: string | null
  lastDeactivationDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  pageNumber: number
  size: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface ProductsResponse {
  data: Product[]
  pagination: Pagination
}

export interface ProductQueryParams {
  pageNumber: number
  size: number
  store: string
  search: string
  sortBy: SortBy
}
