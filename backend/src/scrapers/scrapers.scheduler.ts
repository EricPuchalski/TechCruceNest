import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ScrapersService } from './scrapers.service';

@Injectable()
export class ScrapersScheduler {
  private readonly logger = new Logger(ScrapersScheduler.name);

  constructor(private readonly scrapersService: ScrapersService) {}

  @Cron('0 10 * * *', { timeZone: 'America/Argentina/Buenos_Aires' })
  async handleDailyScraping() {
    this.logger.log('Running scheduled scraper job');
    await this.scrapersService.runAll();
  }
}
