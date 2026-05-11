import type {
  FavoriteItemResponse,
  FavoritesResponse,
} from "../../types/favorites/favorite";
import type {
  FavoriteApiResponse,
  FavoritesApiResponse,
} from "../../types/favorites/favorite-api";
import type { Product } from "../../types/products/product";
import { request, type RequestOptions } from "../api/api-client";

const DEFAULT_CURRENCY = "ARS";

function mapProduct(product: FavoriteApiResponse["product"]): Product {
  return {
    ...product,
    price: Number(product.price),
    currency: DEFAULT_CURRENCY,
    priceHistory: [],
  };
}

function mapFavorite(favorite: FavoriteApiResponse) {
  return {
    ...favorite,
    product: mapProduct(favorite.product),
  };
}

export function fetchFavorites(options?: RequestOptions) {
  return request<FavoritesApiResponse>("/users/me/favorites", {
    method: "GET",
    signal: options?.signal,
  }).then(
    (response): FavoritesResponse => ({
      data: response.items.map(mapFavorite),
    }),
  );
}

export function addFavorite(productId: string) {
  return request<FavoriteApiResponse>("/users/me/favorites", {
    method: "POST",
    body: JSON.stringify({ productId }),
  }).then((response): FavoriteItemResponse => ({
    data: mapFavorite(response),
  }));
}

export function removeFavorite(productId: string) {
  return request(`/users/me/favorites/${productId}`, {
    method: "DELETE",
  });
}
