export interface PriceHistoryApiResponse {
  price: string
  date: string
}

export interface ProductApiResponse {
  id: string
  name: string
  price: string
  imageUrl: string | null
  productUrl: string
  store: string
  hasPriceDropped: boolean
  active: boolean
  lastScrapedAt: string
  lastActivationDate: string | null
  lastDeactivationDate: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductDetailApiResponse extends ProductApiResponse {
  priceHistory: PriceHistoryApiResponse[]
}

export interface ProductsApiResponse {
  items: ProductApiResponse[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}
