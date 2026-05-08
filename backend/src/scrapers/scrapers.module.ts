import { Module } from '@nestjs/common';
import { FullH4rdScraperService } from './fullh4rd-scraper.service';
import { GezatekScraperService } from './gezatek-scraper.service';
import { ScraperPersistenceService } from './scraper.persistence';
import { ScrapersScheduler } from './scrapers.scheduler';
import { ScrapersService } from './scrapers.service';

@Module({
  providers: [
    ScraperPersistenceService,
    FullH4rdScraperService,
    GezatekScraperService,
    ScrapersService,
    ScrapersScheduler,
  ],
  exports: [ScrapersService],
})
export class ScrapersModule {}
