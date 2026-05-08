export interface ExistingProductUpdateInput {
  title: string;
  imageUrl?: string;
  price: number;
  now: Date;
}

export interface PriceHistoryEntryInput {
  price: number;
  currency: string;
  date: Date;
}
