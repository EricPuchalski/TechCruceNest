import type { Product } from '../products/product'

export interface Favorite {
  id: string
  product: Product
  notificationsEnabled: boolean
  lastNotifiedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface FavoritesResponse {
  data: Favorite[]
}

export interface FavoriteItemResponse {
  data: Favorite
}
