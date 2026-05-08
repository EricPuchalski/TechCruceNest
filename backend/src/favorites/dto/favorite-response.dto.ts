import { ProductResponseDto } from '../../products/dto/product-response.dto';

export interface FavoriteResponseDto {
  id: string;
  notificationsEnabled: boolean;
  lastNotifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product: ProductResponseDto;
}

export interface FavoriteRemovedResponseDto {
  message: string;
}
