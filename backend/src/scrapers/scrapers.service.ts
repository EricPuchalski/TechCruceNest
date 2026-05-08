import { Injectable, Logger } from '@nestjs/common';
import { FullH4rdScraperService } from './fullh4rd-scraper.service';
import { GezatekScraperService } from './gezatek-scraper.service';

export interface ScraperRunSummary {
  fullH4rdCount: number;
  gezatekCount: number;
  totalCount: number;
  ranAt: Date;
}

@Injectable()
export class ScrapersService {
  private readonly logger = new Logger(ScrapersService.name);

  constructor(
    private readonly fullH4rdScraperService: FullH4rdScraperService,
    private readonly gezatekScraperService: GezatekScraperService,
  ) {}

  async runAll(): Promise<ScraperRunSummary> {
    const ranAt = new Date();

    this.logger.log('Starting scraper run');

    const [fullH4rdProducts, gezatekProducts] = await Promise.all([
      this.fullH4rdScraperService.updateProducts(),
      this.gezatekScraperService.updateProducts(),
    ]);

    const summary = {
      fullH4rdCount: fullH4rdProducts.length,
      gezatekCount: gezatekProducts.length,
      totalCount: fullH4rdProducts.length + gezatekProducts.length,
      ranAt,
    };

    this.logger.log(
      `Scraper run completed. FullH4rd=${summary.fullH4rdCount}, Gezatek=${summary.gezatekCount}, Total=${summary.totalCount}`,
    );

    return summary;
  }
}
