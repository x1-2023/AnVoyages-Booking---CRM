import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './services/email.service';
import { TelegramService } from './services/telegram.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private emailService: EmailService,
    private telegramService: TelegramService,
  ) {}

  async sendNewBookingNotification(booking: any) {
    try {
      const message = this.formatNewBookingMessage(booking);

      // Send to Telegram
      await this.telegramService.sendMessage(message);

      // Send email if customer provided email
      if (booking.email) {
        await this.emailService.sendBookingConfirmation(booking);
      }

      this.logger.log(`New booking notification sent: ${booking.id}`);
    } catch (error) {
      this.logger.error('Failed to send new booking notification', error);
    }
  }

  async sendBookingStatusUpdateNotification(booking: any) {
    try {
      const message = this.formatStatusUpdateMessage(booking);

      // Send to Telegram
      await this.telegramService.sendMessage(message);

      // Send email if customer provided email
      if (booking.email) {
        await this.emailService.sendStatusUpdate(booking);
      }

      this.logger.log(`Status update notification sent: ${booking.id}`);
    } catch (error) {
      this.logger.error('Failed to send status update notification', error);
    }
  }

  private formatNewBookingMessage(booking: any): string {
    const { customerName, phone, email, location, property, checkIn, checkOut, guests, totalPrice, note } = booking;

    const lines = [
      '🆕 ĐƠN ĐẶT CHỖ MỚI',
      '',
      `👤 Khách hàng: ${customerName}`,
      `📞 SĐT: ${phone}`,
    ];

    if (email) {
      lines.push(`📧 Email: ${email}`);
    }

    lines.push(
      '',
      `📍 Địa điểm: ${location?.name || 'N/A'}`,
    );

    if (property) {
      lines.push(`🏨 Dịch vụ: ${property.name}`);
    }

    lines.push(
      `📅 Check-in: ${new Date(checkIn).toLocaleDateString('vi-VN')}`,
      `📅 Check-out: ${new Date(checkOut).toLocaleDateString('vi-VN')}`,
      `👥 Số khách: ${guests}`,
      `💰 Tổng tiền: ${this.formatCurrency(totalPrice)}`,
    );

    if (note) {
      lines.push('', `📝 Ghi chú: ${note}`);
    }

    lines.push('', '⚠️ Vui lòng liên hệ khách hàng để xác nhận!');

    return lines.join('\n');
  }

  private formatStatusUpdateMessage(booking: any): string {
    const { id, customerName, phone, status, totalPrice, paidAmount } = booking;

    const statusEmoji = {
      pending: '⏳',
      contacted: '📞',
      confirmed: '✅',
      paid: '💳',
      completed: '🎉',
      cancelled: '❌',
    };

    const statusText = {
      pending: 'Chờ xử lý',
      contacted: 'Đã liên hệ',
      confirmed: 'Đã xác nhận',
      paid: 'Đã thanh toán',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };

    return [
      `${statusEmoji[status]} CẬP NHẬT ĐƠN HÀNG`,
      '',
      `ID: ${id.substring(0, 8)}...`,
      `👤 Khách hàng: ${customerName}`,
      `📞 SĐT: ${phone}`,
      `📊 Trạng thái: ${statusText[status]}`,
      `💰 Tổng tiền: ${this.formatCurrency(totalPrice)}`,
      `💳 Đã thanh toán: ${this.formatCurrency(paidAmount)}`,
    ].join('\n');
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}
