import type {
  ProductQueryParams,
  ProductsResponse,
} from "../../types/products/product";
import type {
  PriceHistoryApiResponse,
  ProductApiResponse,
  ProductDetailApiResponse,
  ProductsApiResponse,
} from "../../types/products/product-api";
import { request, type RequestOptions } from "../api/api-client";

const DEFAULT_CURRENCY = "ARS";

function mapPriceHistoryEntry(entry: PriceHistoryApiResponse) {
  return {
    price: Number(entry.price),
    currency: DEFAULT_CURRENCY,
    date: entry.date,
  };
}

function mapProduct(product: ProductApiResponse) {
  return {
    ...product,
    price: Number(product.price),
    currency: DEFAULT_CURRENCY,
    priceHistory: [],
  };
}

function mapProductDetail(product: ProductDetailApiResponse) {
  return {
    ...mapProduct(product),
    priceHistory: product.priceHistory.map(mapPriceHistoryEntry),
  };
}

export function fetchProducts(
  params: ProductQueryParams,
  options?: RequestOptions,
) {
  const query = new URLSearchParams({
    page: String(params.pageNumber + 1),
    limit: String(params.size),
    sortBy: params.sortBy,
  });

  if (params.store) {
    query.set("store", params.store);
  }

  if (params.search.trim()) {
    query.set("search", params.search.trim());
  }

  return request<ProductsApiResponse>(`/products?${query.toString()}`, {
    method: "GET",
    signal: options?.signal,
  }).then((response): ProductsResponse => ({
    data: response.items.map(mapProduct),
    pagination: {
      pageNumber: response.page - 1,
      size: response.limit,
      totalElements: response.totalItems,
      totalPages: response.totalPages,
      hasNext: response.page < response.totalPages,
      hasPrevious: response.page > 1,
    },
  }));
}

export function fetchProductById(productId: string, options?: RequestOptions) {
  return request<ProductDetailApiResponse>(`/products/${productId}`, {
    method: "GET",
    signal: options?.signal,
  }).then(mapProductDetail);
}
