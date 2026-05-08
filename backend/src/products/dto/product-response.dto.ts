export interface ProductResponseDto {
  id: string;
  name: string;
  price: string;
  imageUrl: string | null;
  productUrl: string;
  store: string;
  hasPriceDropped: boolean;
  active: boolean;
  lastScrapedAt: Date;
  lastActivationDate: Date | null;
  lastDeactivationDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceHistoryResponseDto {
  id: string;
  productId: string;
  price: string;
  date: Date;
}

export interface ProductDetailResponseDto extends ProductResponseDto {
  priceHistory: PriceHistoryResponseDto[];
}
