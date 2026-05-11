import type { ProductApiResponse } from '../products/product-api'

export interface FavoriteApiResponse {
  id: string
  notificationsEnabled: boolean
  lastNotifiedAt: string | null
  createdAt: string
  updatedAt: string
  product: ProductApiResponse
}

export interface FavoritesApiResponse {
  items: FavoriteApiResponse[]
}
