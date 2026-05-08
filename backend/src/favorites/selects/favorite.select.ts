import { Prisma } from '@prisma/client';
import { PRODUCT_LIST_SELECT } from '../../products/selects/product.select';

export const FAVORITE_SELECT = {
  id: true,
  notificationsEnabled: true,
  lastNotifiedAt: true,
  createdAt: true,
  updatedAt: true,
  product: {
    select: PRODUCT_LIST_SELECT,
  },
} satisfies Prisma.FavoriteSelect;
