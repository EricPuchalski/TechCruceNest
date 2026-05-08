import { Prisma } from '@prisma/client';
import {
  ProductDetailResponseDto,
  ProductResponseDto,
} from '../dto/product-response.dto';
import {
  PRODUCT_DETAIL_SELECT,
  PRODUCT_LIST_SELECT,
} from '../selects/product.select';

type ProductListPayload = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_LIST_SELECT;
}>;

type ProductDetailPayload = Prisma.ProductGetPayload<{
  select: typeof PRODUCT_DETAIL_SELECT;
}>;

export class ProductMapper {
  static toResponse(product: ProductListPayload): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      productUrl: product.productUrl,
      store: product.store,
      hasPriceDropped: product.hasPriceDropped,
      active: product.active,
      lastScrapedAt: product.lastScrapedAt,
      lastActivationDate: product.lastActivationDate,
      lastDeactivationDate: product.lastDeactivationDate,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  static toDetailResponse(
    product: ProductDetailPayload,
  ): ProductDetailResponseDto {
    return {
      ...this.toResponse(product),
      priceHistory: product.priceHistory.map((entry) => ({
        id: entry.id,
        productId: entry.productId,
        price: entry.price.toString(),
        date: entry.date,
      })),
    };
  }
}
