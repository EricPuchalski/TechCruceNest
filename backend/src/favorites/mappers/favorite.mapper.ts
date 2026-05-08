import { Prisma } from '@prisma/client';
import { FavoriteResponseDto } from '../dto/favorite-response.dto';
import { FAVORITE_SELECT } from '../selects/favorite.select';

type FavoritePayload = Prisma.FavoriteGetPayload<{
  select: typeof FAVORITE_SELECT;
}>;

export class FavoriteMapper {
  static toResponse(favorite: FavoritePayload): FavoriteResponseDto {
    const product = favorite.product;

    return {
      id: favorite.id,
      notificationsEnabled: favorite.notificationsEnabled,
      lastNotifiedAt: favorite.lastNotifiedAt,
      createdAt: favorite.createdAt,
      updatedAt: favorite.updatedAt,
      product: {
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
      },
    };
  }
}
