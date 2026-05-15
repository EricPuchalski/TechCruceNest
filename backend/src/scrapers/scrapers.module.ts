import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { FullH4rdScraperService } from './fullh4rd-scraper.service';
import { GezatekScraperService } from './gezatek-scraper.service';
import { ScraperPersistenceService } from './scraper.persistence';
import { ScrapersScheduler } from './scrapers.scheduler';
import { ScrapersService } from './scrapers.service';

@Module({
  imports: [NotificationsModule],
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
