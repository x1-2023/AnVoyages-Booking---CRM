import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get('SMTP_HOST');
    const port = this.configService.get('SMTP_PORT');
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASS');

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: {
          user,
          pass,
        },
      });
    } else {
      this.logger.warn('Email service not configured. Emails will not be sent.');
    }
  }

  async sendBookingConfirmation(booking: any) {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized');
      return;
    }

    try {
      const emailFrom = this.configService.get('EMAIL_FROM') || 'noreply@anvoyages.vn';

      const html = this.generateBookingConfirmationHtml(booking);

      await this.transporter.sendMail({
        from: emailFrom,
        to: booking.email,
        subject: 'Xác nhận đặt chỗ - An Voyages',
        html,
      });

      this.logger.log(`Booking confirmation email sent to ${booking.email}`);
    } catch (error) {
      this.logger.error('Failed to send booking confirmation email', error);
    }
  }

  async sendStatusUpdate(booking: any) {
    if (!this.transporter) {
      this.logger.warn('Email transporter not initialized');
      return;
    }

    try {
      const emailFrom = this.configService.get('EMAIL_FROM') || 'noreply@anvoyages.vn';

      const html = this.generateStatusUpdateHtml(booking);

      await this.transporter.sendMail({
        from: emailFrom,
        to: booking.email,
        subject: 'Cập nhật trạng thái đơn đặt chỗ - An Voyages',
        html,
      });

      this.logger.log(`Status update email sent to ${booking.email}`);
    } catch (error) {
      this.logger.error('Failed to send status update email', error);
    }
  }

  private generateBookingConfirmationHtml(booking: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Xác nhận đặt chỗ</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${booking.customerName}</strong>,</p>
            <p>Cảm ơn bạn đã đặt chỗ với An Voyages. Chúng tôi đã nhận được yêu cầu của bạn với thông tin sau:</p>

            <div class="info-row">
              <span class="label">Địa điểm:</span> ${booking.location?.name || 'N/A'}
            </div>
            ${booking.property ? `<div class="info-row"><span class="label">Dịch vụ:</span> ${booking.property.name}</div>` : ''}
            <div class="info-row">
              <span class="label">Check-in:</span> ${new Date(booking.checkIn).toLocaleDateString('vi-VN')}
            </div>
            <div class="info-row">
              <span class="label">Check-out:</span> ${new Date(booking.checkOut).toLocaleDateString('vi-VN')}
            </div>
            <div class="info-row">
              <span class="label">Số khách:</span> ${booking.guests}
            </div>
            <div class="info-row">
              <span class="label">Tổng tiền:</span> ${this.formatCurrency(booking.totalPrice)}
            </div>
            ${booking.note ? `<div class="info-row"><span class="label">Ghi chú:</span> ${booking.note}</div>` : ''}

            <p style="margin-top: 20px;">Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận và hoàn tất đặt chỗ.</p>
            <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi qua số điện thoại hoặc email.</p>
          </div>
          <div class="footer">
            <p>An Voyages - Travel Booking Management System</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateStatusUpdateHtml(booking: any): string {
    const statusText = {
      pending: 'Chờ xử lý',
      contacted: 'Đã liên hệ',
      confirmed: 'Đã xác nhận',
      paid: 'Đã thanh toán',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; }
          .status { display: inline-block; padding: 5px 15px; border-radius: 20px; background-color: #4CAF50; color: white; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cập nhật trạng thái đơn đặt chỗ</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${booking.customerName}</strong>,</p>
            <p>Đơn đặt chỗ của bạn đã được cập nhật trạng thái:</p>

            <div style="text-align: center; margin: 20px 0;">
              <span class="status">${statusText[booking.status] || booking.status}</span>
            </div>

            <div class="info-row">
              <span class="label">Địa điểm:</span> ${booking.location?.name || 'N/A'}
            </div>
            ${booking.property ? `<div class="info-row"><span class="label">Dịch vụ:</span> ${booking.property.name}</div>` : ''}
            <div class="info-row">
              <span class="label">Tổng tiền:</span> ${this.formatCurrency(booking.totalPrice)}
            </div>
            <div class="info-row">
              <span class="label">Đã thanh toán:</span> ${this.formatCurrency(booking.paidAmount)}
            </div>

            ${booking.adminNote ? `<p style="margin-top: 20px;"><strong>Ghi chú:</strong> ${booking.adminNote}</p>` : ''}

            <p style="margin-top: 20px;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          </div>
          <div class="footer">
            <p>An Voyages - Travel Booking Management System</p>
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}
