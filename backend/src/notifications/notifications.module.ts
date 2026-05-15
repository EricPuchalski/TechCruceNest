import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PriceDropNotificationService } from './price-drop-notification.service';

@Module({
  imports: [PrismaModule],
  providers: [PriceDropNotificationService],
  exports: [PriceDropNotificationService],
})
export class NotificationsModule {}
