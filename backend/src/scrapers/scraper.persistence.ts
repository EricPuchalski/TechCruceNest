import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PriceDropNotificationService } from '../notifications/price-drop-notification.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ExistingProductUpdateInput,
  PriceHistoryEntryInput,
} from './types/scraped-product.types';

const PRODUCT_WITH_HISTORY_INCLUDE = {
  priceHistory: {
    orderBy: {
      date: 'asc',
    },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithHistory = Prisma.ProductGetPayload<{
  include: typeof PRODUCT_WITH_HISTORY_INCLUDE;
}>;

export type Product = ProductWithHistory;

@Injectable()
export class ScraperPersistenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly priceDropNotificationService: PriceDropNotificationService,
  ) {}

  async findProductByUrl(
    productUrl: string,
  ): Promise<ProductWithHistory | null> {
    return this.prisma.product.findUnique({
      where: { productUrl },
      include: PRODUCT_WITH_HISTORY_INCLUDE,
    });
  }

  async createProduct(params: {
    name: string;
    imageUrl?: string;
    productUrl: string;
    store: string;
    price: number;
    currency: string;
    now: Date;
  }): Promise<ProductWithHistory> {
    return this.prisma.product.create({
      data: {
        name: params.name,
        imageUrl: params.imageUrl,
        productUrl: params.productUrl,
        store: params.store,
        price: params.price,
        currency: params.currency,
        hasPriceDropped: false,
        active: true,
        lastScrapedAt: params.now,
        lastActivationDate: params.now,
        priceHistory: {
          create: [
            this.buildPriceHistoryEntry(
              params.price,
              params.currency,
              params.now,
            ),
          ],
        },
      },
      include: PRODUCT_WITH_HISTORY_INCLUDE,
    });
  }

  async updateExistingProduct(
    product: ProductWithHistory,
    store: string,
    params: ExistingProductUpdateInput,
    currency: string,
  ): Promise<ProductWithHistory> {
    const lastPrice = product.priceHistory.at(-1)?.price;
    const lastPriceNumber = lastPrice ? Number(lastPrice) : null;
    const priceDropped =
      lastPriceNumber !== null && params.price < lastPriceNumber;

    const updateData: Prisma.ProductUpdateInput = {
      name: params.title,
      imageUrl: params.imageUrl,
      store,
      lastScrapedAt: params.now,
      hasPriceDropped: priceDropped,
      active: true,
    };

    if (!product.active) {
      updateData.lastActivationDate = params.now;
    }

    if (lastPriceNumber === null || lastPriceNumber !== params.price) {
      updateData.price = params.price;
      updateData.priceHistory = {
        create: [
          this.buildPriceHistoryEntry(params.price, currency, params.now),
        ],
      };
    } else {
      updateData.price = params.price;
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id: product.id },
      data: updateData,
      include: PRODUCT_WITH_HISTORY_INCLUDE,
    });

    if (
      priceDropped &&
      lastPriceNumber !== null &&
      lastPriceNumber !== params.price
    ) {
      await this.priceDropNotificationService.notifyInterestedUsers({
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        productUrl: updatedProduct.productUrl,
        imageUrl: updatedProduct.imageUrl,
        store: updatedProduct.store,
        currency,
        previousPrice: lastPriceNumber,
        currentPrice: params.price,
        notifiedAt: params.now,
      });
    }

    return updatedProduct;
  }

  async deactivateMissingProducts(
    store: string,
    seenUrls: Set<string>,
    now: Date,
  ): Promise<number> {
    if (seenUrls.size === 0) {
      return 0;
    }

    const result = await this.prisma.product.updateMany({
      where: {
        store,
        active: true,
        productUrl: {
          notIn: [...seenUrls],
        },
      },
      data: {
        active: false,
        lastDeactivationDate: now,
        lastScrapedAt: now,
      },
    });

    return result.count;
  }

  private buildPriceHistoryEntry(
    price: number,
    currency: string,
    date: Date,
  ): PriceHistoryEntryInput {
    return {
      price,
      currency,
      date,
    };
  }
}
