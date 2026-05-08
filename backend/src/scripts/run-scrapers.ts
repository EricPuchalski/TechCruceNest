import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ScrapersService } from '../scrapers/scrapers.service';

async function bootstrap() {
  const logger = new Logger('RunScrapersScript');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const scrapersService = app.get(ScrapersService);
    const summary = await scrapersService.runAll();
    logger.log(
      `Scrapers finished. FullH4rd=${summary.fullH4rdCount}, Gezatek=${summary.gezatekCount}, Total=${summary.totalCount}`,
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  const logger = new Logger('RunScrapersScript');
  logger.error('Scraper script failed', error);
  process.exitCode = 1;
});
