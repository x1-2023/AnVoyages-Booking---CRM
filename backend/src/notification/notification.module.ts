import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailService } from './services/email.service';
import { TelegramService } from './services/telegram.service';

@Module({
  providers: [NotificationService, EmailService, TelegramService],
  exports: [NotificationService],
})
export class NotificationModule {}
