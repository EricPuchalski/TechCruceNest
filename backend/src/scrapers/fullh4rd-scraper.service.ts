import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { FULLH4RD_SELECTORS } from './constants/css-selectors.constants';
import {
  FULLH4RD_BASE_CATEGORY_URL,
  FULLH4RD_CATEGORIES,
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
export class FullH4rdScraperService {
  private readonly logger = new Logger(FullH4rdScraperService.name);

  constructor(
    private readonly scraperPersistenceService: ScraperPersistenceService,
  ) {}

  async updateProducts(): Promise<Product[]> {
    const now = new Date();
    const collectedProducts: Product[] = [];
    const seenUrls = new Set<string>();
    const categoryUrls = ScraperUtils.buildCategoryUrls(
      FULLH4RD_BASE_CATEGORY_URL,
      FULLH4RD_CATEGORIES,
    );

    for (const categoryUrl of categoryUrls) {
      try {
        const products = await this.scrapeCategory(categoryUrl, seenUrls, now);
        collectedProducts.push(...products);
      } catch (error) {
        if (ScraperUtils.isForbiddenAxiosError(error)) {
          this.logger.warn(
            'FullH4rd is currently protected by Cloudflare and returned 403. Skipping the rest of this store for this run.',
          );
          break;
        }

        this.logger.error(
          `Error scraping category ${categoryUrl}: ${ScraperUtils.getErrorMessage(error)}`,
        );
      }
    }

    await this.scraperPersistenceService.deactivateMissingProducts(
      SCRAPER_STORES.fullH4rd,
      seenUrls,
      now,
    );

    return collectedProducts;
  }

  private async scrapeCategory(
    categoryUrl: string,
    seenUrls: Set<string>,
    now: Date,
  ): Promise<Product[]> {
    const collectedProducts: Product[] = [];
    let page = 1;

    while (true) {
      const pageUrl = ScraperUtils.buildPagedCategoryUrl(categoryUrl, page);
      const $ = await this.fetchDocument(pageUrl);
      const addedProducts = await this.parsePage($, collectedProducts, seenUrls, now);

      if (addedProducts === 0 || !this.hasNextPage($)) {
        break;
      }

      page += 1;
    }

    return collectedProducts;
  }

  private async parsePage(
    $: CheerioRoot,
    collectedProducts: Product[],
    seenUrls: Set<string>,
    now: Date,
  ): Promise<number> {
    const cards = $(FULLH4RD_SELECTORS.productList).toArray();

    if (cards.length === 0) {
      return 0;
    }

    for (const card of cards) {
      try {
        const product = await this.upsertProduct($, card, seenUrls, now);

        if (product) {
          collectedProducts.push(product);
        }
      } catch (error) {
        this.logger.error(
          `Error processing FullH4rd product: ${ScraperUtils.getErrorMessage(error)}`,
        );
      }
    }

    return cards.length;
  }

  private async upsertProduct(
    $: CheerioRoot,
    card: CheerioElement,
    seenUrls: Set<string>,
    now: Date,
  ): Promise<Product | null> {
    const title = $(card).find(FULLH4RD_SELECTORS.title).text().trim();
    const price = this.extractPrice($, card);
    const imageUrl = this.buildFullUrl(
      $(card).find(FULLH4RD_SELECTORS.image).attr('src'),
    );
    const productUrl = this.buildFullUrl(
      $(card).find(FULLH4RD_SELECTORS.link).attr('href'),
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
        SCRAPER_STORES.fullH4rd,
        {
          title,
          imageUrl: imageUrl || undefined,
          price,
          now,
        },
        SCRAPER_DEFAULTS.currency,
      );
    }

    return this.scraperPersistenceService.createProduct({
      name: title,
      imageUrl: imageUrl || undefined,
      productUrl,
      store: SCRAPER_STORES.fullH4rd,
      price,
      currency: SCRAPER_DEFAULTS.currency,
      now,
    });
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

  private extractPrice($: CheerioRoot, card: CheerioElement): number | null {
    const priceElement = $(card).find(FULLH4RD_SELECTORS.price).first();
    const ownText = priceElement
      .contents()
      .filter((_, node) => node.type === 'text')
      .text()
      .trim();

    if (!ownText) {
      return null;
    }

    const normalizedPrice = ownText.includes(',')
      ? ownText.split(',')[0]
      : ownText;
    const digits = normalizedPrice.replace(/[^\d]/g, '');

    if (!digits) {
      return null;
    }

    return Number(digits);
  }

  private hasNextPage($: CheerioRoot): boolean {
    return $(FULLH4RD_SELECTORS.nextPage).first().length > 0;
  }

  private buildFullUrl(relativeUrl?: string): string {
    return ScraperUtils.buildAbsoluteUrl(SCRAPER_URLS.fullH4rdBase, relativeUrl);
  }
}
