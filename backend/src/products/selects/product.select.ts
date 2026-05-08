import { Prisma } from '@prisma/client';

export const PRODUCT_LIST_SELECT = {
  id: true,
  name: true,
  price: true,
  imageUrl: true,
  productUrl: true,
  store: true,
  hasPriceDropped: true,
  active: true,
  lastScrapedAt: true,
  lastActivationDate: true,
  lastDeactivationDate: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export const PRODUCT_DETAIL_SELECT = {
  ...PRODUCT_LIST_SELECT,
  priceHistory: {
    orderBy: {
      date: 'desc',
    },
    select: {
      id: true,
      productId: true,
      price: true,
      date: true,
    },
  },
} satisfies Prisma.ProductSelect;
