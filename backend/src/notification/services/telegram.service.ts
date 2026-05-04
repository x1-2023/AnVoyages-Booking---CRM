import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot | null = null;
  private chatId: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get('TELEGRAM_BOT_TOKEN');
    this.chatId = this.configService.get('TELEGRAM_ADMIN_CHAT_ID');

    if (token && this.chatId) {
      try {
        this.bot = new TelegramBot(token, { polling: false });
        this.logger.log('Telegram bot initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Telegram bot', error);
      }
    } else {
      this.logger.warn('Telegram service not configured. Messages will not be sent.');
    }
  }

  async sendMessage(message: string) {
    if (!this.bot || !this.chatId) {
      this.logger.warn('Telegram bot not initialized or chat ID not configured');
      return;
    }

    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
      });

      this.logger.log('Telegram message sent successfully');
    } catch (error) {
      this.logger.error('Failed to send Telegram message', error);
    }
  }

  async sendDocument(filePath: string, caption?: string) {
    if (!this.bot || !this.chatId) {
      this.logger.warn('Telegram bot not initialized or chat ID not configured');
      return;
    }

    try {
      await this.bot.sendDocument(this.chatId, filePath, {
        caption,
      });

      this.logger.log('Telegram document sent successfully');
    } catch (error) {
      this.logger.error('Failed to send Telegram document', error);
    }
  }
}
