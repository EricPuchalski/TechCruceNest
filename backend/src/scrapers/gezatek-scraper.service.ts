import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { GEZATEK_SELECTORS } from './constants/css-selectors.constants';
import {
  GEZATEK_BASE_CATEGORY_URL,
  GEZATEK_CATEGORIES,
} from './constants/categories.constants';
import {
  SCRAPER_DEFAULTS,
  SCRAPER_STORES,
  SCRAPER_URLS,
} from './constants/scraper.constants';
import { ScraperPersistenceService, Product } from './scraper.persistence';
import { ScraperUtils } from './utils/scraper.utils';

type CheerioRoot = cheerio.CheerioAPI;
type CheerioElement = AnyNode;

@Injectable()
export class GezatekScraperService {
  private readonly logger = new Logger(GezatekScraperService.name);

  constructor(
    private readonly scraperPersistenceService: ScraperPersistenceService,
  ) {}

  async updateProducts(): Promise<Product[]> {
    const now = new Date();
    const collectedProducts: Product[] = [];
    const seenUrls = new Set<string>();
    const categoryUrls = ScraperUtils.buildCategoryUrls(
      GEZATEK_BASE_CATEGORY_URL,
      GEZATEK_CATEGORIES,
    );

    for (const categoryUrl of categoryUrls) {
      try {
        const $ = await this.fetchDocument(categoryUrl);
        const products = await this.parsePage($, seenUrls, now);
        collectedProducts.push(...products);
      } catch (error) {
        this.logger.error(
          `Error scraping category ${categoryUrl}: ${ScraperUtils.getErrorMessage(error)}`,
        );
      }
    }

    await this.scraperPersistenceService.deactivateMissingProducts(
      SCRAPER_STORES.gezatek,
      seenUrls,
      now,
    );

    return collectedProducts;
  }

  private async fetchDocument(url: string): Promise<CheerioRoot> {
    const response = await axios.get<string>(url, {
      headers: {
        'User-Agent': SCRAPER_DEFAULTS.userAgent,
      },
      timeout: SCRAPER_DEFAULTS.timeoutMs,
    });

    return cheerio.load(response.data);
  }

  private async parsePage(
    $: CheerioRoot,
    seenUrls: Set<string>,
    now: Date,
  ): Promise<Product[]> {
    const cards = $(GEZATEK_SELECTORS.productList).toArray();
    const processedProducts: Product[] = [];

    for (const card of cards) {
      try {
        const product = await this.upsertProduct($, card, seenUrls, now);

        if (product) {
          processedProducts.push(product);
        }
      } catch (error) {
        this.logger.error(
          `Error processing Gezatek product: ${ScraperUtils.getErrorMessage(error)}`,
        );
      }
    }

    return processedProducts;
  }

  private async upsertProduct(
    $: CheerioRoot,
    card: CheerioElement,
    seenUrls: Set<string>,
    now: Date,
  ): Promise<Product | null> {
    const title = $(card).find(GEZATEK_SELECTORS.title).text().trim();
    const price = this.extractPrice($, card);
    const imageUrl = this.extractImageUrl($, card);
    const productUrl = this.buildFullUrl(
      $(card).find(GEZATEK_SELECTORS.link).attr('href'),
    );

    if (!productUrl || !title || price === null) {
      return null;
    }

    seenUrls.add(productUrl);

    const existingProduct =
      await this.scraperPersistenceService.findProductByUrl(productUrl);

    if (existingProduct) {
      return this.scraperPersistenceService.updateExistingProduct(
        existingProduct,
        SCRAPER_STORES.gezatek,
        {
          title,
          imageUrl,
          price,
          now,
        },
        SCRAPER_DEFAULTS.currency,
      );
    }

    return this.scraperPersistenceService.createProduct({
      name: title,
      imageUrl,
      productUrl,
      store: SCRAPER_STORES.gezatek,
      price,
      currency: SCRAPER_DEFAULTS.currency,
      now,
    });
  }

  private extractPrice($: CheerioRoot, card: CheerioElement): number | null {
    const priceText = $(card)
      .find(GEZATEK_SELECTORS.price)
      .attr(GEZATEK_SELECTORS.priceAttribute)
      ?.trim();

    if (!priceText) {
      return null;
    }

    const parsedPrice = Number(priceText);

    if (Number.isNaN(parsedPrice)) {
      return null;
    }

    return parsedPrice;
  }

  private extractImageUrl(
    $: CheerioRoot,
    card: CheerioElement,
  ): string | undefined {
    const image = $(card).find(GEZATEK_SELECTORS.image).first();

    const rawImageUrl =
      image.attr('src')?.trim() ||
      image.attr('data-src')?.trim() ||
      image.attr('data-lazy-src')?.trim() ||
      ScraperUtils.extractFirstSrcsetUrl(image.attr('srcset')) ||
      ScraperUtils.extractFirstSrcsetUrl(image.attr('data-srcset'));

    if (!rawImageUrl) {
      return undefined;
    }

    return this.buildFullUrl(rawImageUrl);
  }

  private buildFullUrl(relativeUrl?: string): string {
    return ScraperUtils.buildAbsoluteUrl(SCRAPER_URLS.gezatekBase, relativeUrl);
  }
}
