import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SePayPgClient } from 'sepay-pg-node';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { SettingsService } from '../settings/settings.service';
import { CaptchaService } from '../security/captcha.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateSepayCheckoutDto } from './dto/create-sepay-checkout.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { BookingStatus } from './enums/booking-status.enum';

interface SepaySettings {
  enabled: boolean;
  env: 'sandbox' | 'production';
  merchantId: string;
  secretKey: string;
  paymentMethod: 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER';
  currency: string;
  orderPrefix: string;
  depositPercent: number;
  transferTemplate: string;
  successUrl: string;
  errorUrl: string;
  cancelUrl: string;
  ipnSecretKey: string;
}

@Injectable()
export class BookingService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private settingsService: SettingsService,
    private captchaService: CaptchaService,
  ) {}

  async create(createBookingDto: CreateBookingDto, remoteIp?: string) {
    await this.captchaService.verifyTurnstile(createBookingDto.captchaToken, remoteIp);
    const bookingInput = { ...createBookingDto };
    delete bookingInput.captchaToken;
    delete bookingInput.totalPrice;

    const location = await this.prisma.location.findUnique({
      where: { id: createBookingDto.locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const property = createBookingDto.propertyId
      ? await this.prisma.property.findUnique({
          where: { id: createBookingDto.propertyId },
        })
      : null;

    if (createBookingDto.propertyId && !property) {
      throw new NotFoundException('Property not found');
    }

    if (property && !property.isActive) {
      throw new BadRequestException('Property is not available');
    }

    const productOption = createBookingDto.productOptionId
      ? await this.prisma.productOption.findFirst({
          where: {
            id: createBookingDto.productOptionId,
            propertyId: createBookingDto.propertyId,
            isActive: true,
          },
        })
      : null;

    if (createBookingDto.productOptionId && !productOption) {
      throw new NotFoundException('Product option not found');
    }

    const customer = await this.prisma.customer.upsert({
      where: { phone: createBookingDto.phone },
      update: {
        name: createBookingDto.customerName,
        email: createBookingDto.email,
        source: 'web',
      },
      create: {
        name: createBookingDto.customerName,
        phone: createBookingDto.phone,
        email: createBookingDto.email,
        source: 'web',
      },
    });

    const pricing = this.resolveBookingPricing(createBookingDto, property, productOption);
    const unitCost = productOption?.costPrice || property?.costPrice || 0;
    const totalCost = pricing.fixedDuration ? unitCost : unitCost * pricing.nights;
    const paymentSettings = await this.getSepaySettings();
    const bookingCode = await this.generateBookingCode(paymentSettings.orderPrefix);
    const depositPercent = this.resolveRequestedDepositPercent(
      createBookingDto.depositPercent,
      createBookingDto.bookingIntent,
      paymentSettings.depositPercent,
    );
    const depositAmount = this.resolveInitialDeposit(pricing.totalPrice, depositPercent);
    const paymentReference = createBookingDto.paymentReference ?? bookingCode;
    const transferContent = createBookingDto.transferContent
      ?? this.buildTransferContent(
        paymentSettings.transferTemplate,
        bookingCode,
        createBookingDto.customerName,
        createBookingDto.phone,
      );

    const booking = await this.prisma.booking.create({
      data: {
        ...bookingInput,
        customerId: customer.id,
        bookingCode,
        productOptionName: productOption?.name || productOption?.nameVi || productOption?.nameEn,
        productOptionType: productOption?.optionType,
        productOptionPrice: productOption?.basePrice,
        productOptionDurationDays: productOption?.durationDays ?? property?.durationDays,
        checkIn: pricing.checkIn,
        checkOut: pricing.checkOut,
        totalCost,
        totalPrice: pricing.totalPrice,
        profit: Math.max(pricing.totalPrice - totalCost, 0),
        depositAmount,
        depositPercent,
        discountCode: this.normalizeDiscountCode(createBookingDto.discountCode),
        paymentReference,
        transferContent,
        status: BookingStatus.PENDING,
      },
      include: this.includeRelations(),
    });

    await this.prisma.lead.create({
      data: {
        customerId: customer.id,
        propertyId: createBookingDto.propertyId,
        status: 'new',
        travelDate: this.normalizeDateInput(createBookingDto.checkIn),
        numPeople: createBookingDto.guests,
        budget: pricing.totalPrice,
        source: 'web',
        notes: createBookingDto.note,
      },
    });

    await this.notificationService.sendNewBookingNotification(booking);

    return this.attachSepayCheckout(booking);
  }

  async findAll(
    status?: BookingStatus,
    locationId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const where: any = {};

    if (status) where.status = status;
    if (locationId) where.locationId = locationId;

    if (startDate || endDate) {
      where.checkIn = {};
      if (startDate) where.checkIn.gte = startDate;
      if (endDate) where.checkIn.lte = endDate;
    }

    return this.prisma.booking.findMany({
      where,
      include: this.includeRelations(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: this.includeRelations(),
    });

    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async createSepayCheckout(id: string, checkoutDto: CreateSepayCheckoutDto) {
    const lookup = (id || '').trim();
    const bookingCode = checkoutDto?.bookingCode?.trim();
    const phone = this.normalizePhone(checkoutDto?.phone);

    if (!lookup || !phone) {
      throw new BadRequestException('Booking identifier and phone are required');
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        AND: [
          {
            OR: [
              { id: lookup },
              { bookingCode: lookup },
            ],
          },
          ...(bookingCode ? [{ bookingCode }] : []),
        ],
      },
      include: this.includeRelations(),
    });

    if (!booking || this.normalizePhone(booking.phone) !== phone) {
      throw new NotFoundException('Booking not found for provided public verification');
    }

    if (bookingCode && booking.bookingCode !== bookingCode) {
      throw new NotFoundException('Booking not found for provided public verification');
    }

    return this.attachSepayCheckout(booking, true);
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: this.includeRelations(),
    });
  }

  async updateStatus(id: string, updateStatusDto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    this.validateStatusTransition(booking.status, updateStatusDto.status);

    const paidAmount = updateStatusDto.paidAmount ?? booking.paidAmount;
    const paymentStatus = this.resolvePaymentStatus(paidAmount, booking.totalPrice, booking.paymentStatus);

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
        adminNote: updateStatusDto.adminNote,
        paidAmount,
        paymentStatus,
      },
      include: this.includeRelations(),
    });

    await this.notificationService.sendBookingStatusUpdateNotification(updated);
    return updated;
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    if (updatePaymentDto.paidAmount < 0 || updatePaymentDto.paidAmount > booking.totalPrice) {
      throw new BadRequestException('Invalid paid amount');
    }

    const paymentStatus = this.resolvePaymentStatus(updatePaymentDto.paidAmount, booking.totalPrice);
    const paymentReference = updatePaymentDto.paymentReference ?? booking.paymentReference ?? booking.bookingCode ?? id;
    const paymentSettings = await this.getSepaySettings();
    const transferContent = updatePaymentDto.transferContent
      ?? booking.transferContent
      ?? this.buildTransferContent(paymentSettings.transferTemplate, paymentReference, booking.customerName, booking.phone);

    if (updatePaymentDto.amount && updatePaymentDto.amount > 0) {
      const method = updatePaymentDto.method ?? 'bank_transfer';
      const referenceCode = updatePaymentDto.referenceCode ?? paymentReference;
      const existingPayment = referenceCode
        ? await this.prisma.payment.findFirst({
            where: {
              bookingId: id,
              method,
              referenceCode,
            },
          })
        : null;

      if (!existingPayment) {
        await this.prisma.payment.create({
          data: {
            bookingId: id,
            amount: updatePaymentDto.amount,
            type: updatePaymentDto.type ?? (paymentStatus === 'paid' ? 'final_payment' : 'deposit'),
            method,
            referenceCode,
            transferContent,
            note: updatePaymentDto.note,
          },
        });
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        paidAmount: updatePaymentDto.paidAmount,
        depositAmount: this.resolveDepositAmount(booking.depositAmount, updatePaymentDto.paidAmount, paymentStatus),
        paymentStatus,
        paymentReference,
        transferContent,
        status: this.resolveBookingStatusAfterPayment(booking.status, paymentStatus),
      },
      include: this.includeRelations(),
    });
  }

  async remove(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    await this.prisma.booking.delete({ where: { id } });
    return { message: 'Booking deleted successfully' };
  }

  async getStats(locationId?: string) {
    const where: any = {};
    if (locationId) where.locationId = locationId;

    const [total, pending, contacted, quoted, confirmed, deposit, paid, completed, cancelled] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.PENDING } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.CONTACTED } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.QUOTED } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.CONFIRMED } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.DEPOSIT } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.PAID } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.COMPLETED } }),
      this.prisma.booking.count({ where: { ...where, status: BookingStatus.CANCELLED } }),
    ]);

    return { total, pending, contacted, quoted, confirmed, deposit, paid, completed, cancelled };
  }

  private normalizeDateInput(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private resolveBookingPricing(createBookingDto: CreateBookingDto, property: any, productOption: any) {
    if (!property) {
      throw new BadRequestException('Property is required for booking pricing');
    }

    const guests = Number(createBookingDto.guests);
    if (!Number.isInteger(guests) || guests < 1) {
      throw new BadRequestException('Guests must be at least 1');
    }

    const checkIn = this.normalizeDateInput(createBookingDto.checkIn);
    const requestedCheckOut = this.normalizeDateInput(createBookingDto.checkOut);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(requestedCheckOut.getTime())) {
      throw new BadRequestException('Invalid booking dates');
    }

    const durationDays = productOption?.durationDays ?? property.durationDays ?? 0;
    const fixedDuration = Boolean((property.type === 'tour' || property.type === 'cruise') && durationDays > 0);
    const unitPrice = productOption?.basePrice ?? property.basePrice;

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new BadRequestException('Product price is not configured');
    }

    if (fixedDuration) {
      const checkOut = new Date(checkIn);
      checkOut.setUTCDate(checkOut.getUTCDate() + Math.max(durationDays - 1, 1));

      return {
        checkIn,
        checkOut,
        nights: Math.max(durationDays - 1, 1),
        fixedDuration,
        totalPrice: Math.round(unitPrice),
      };
    }

    if (requestedCheckOut <= checkIn) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    const nights = Math.ceil((requestedCheckOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    return {
      checkIn,
      checkOut: requestedCheckOut,
      nights,
      fixedDuration,
      totalPrice: Math.round(unitPrice * nights),
    };
  }

  private validateStatusTransition(currentStatus: string, newStatus: string) {
    if (currentStatus === newStatus) return;

    const validTransitions: Record<string, string[]> = {
      [BookingStatus.PENDING]: [BookingStatus.CONTACTED, BookingStatus.QUOTED, BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONTACTED]: [BookingStatus.QUOTED, BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.QUOTED]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.DEPOSIT, BookingStatus.PAID, BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.DEPOSIT]: [BookingStatus.PAID, BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.PAID]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private async generateBookingCode(prefix = 'AV') {
    const date = new Date();
    const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    const count = await this.prisma.booking.count({
      where: { createdAt: { gte: start, lt: end } },
    });

    return `${this.normalizeCodePrefix(prefix)}-${stamp}-${String(count + 1).padStart(3, '0')}`;
  }

  private resolvePaymentStatus(paidAmount: number, totalPrice: number, fallback = 'unpaid') {
    if (paidAmount >= totalPrice) return 'paid';
    if (paidAmount > 0) return 'deposit';
    return fallback;
  }

  private resolveDepositAmount(currentDeposit: number, paidAmount: number, paymentStatus: string) {
    if (paymentStatus === 'deposit') return Math.max(currentDeposit, paidAmount);
    return currentDeposit;
  }

  private resolveBookingStatusAfterPayment(currentStatus: string, paymentStatus: string) {
    if ([BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(currentStatus as BookingStatus)) {
      return currentStatus;
    }

    if (paymentStatus === 'paid') return BookingStatus.PAID;
    if (paymentStatus === 'deposit') return BookingStatus.DEPOSIT;
    return currentStatus;
  }

  private buildTransferContent(template: string, reference: string, customerName: string, phone: string) {
    const normalizedName = customerName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/\s+/g, ' ')
      .toUpperCase();
    const phoneSuffix = phone.replace(/\D/g, '').slice(-4);

    return (template || '{bookingCode} {customerName} {phoneLast4}')
      .replace(/\{bookingCode\}/g, reference)
      .replace(/\{customerName\}/g, normalizedName)
      .replace(/\{phoneLast4\}/g, phoneSuffix)
      .replace(/\{phone\}/g, phone.replace(/\D/g, ''))
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeCodePrefix(prefix: string) {
    return (prefix || 'AV')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 8) || 'AV';
  }

  private normalizePhone(phone?: string | null) {
    return (phone || '').replace(/\D/g, '');
  }

  private resolveRequestedDepositPercent(requestedPercent: number | undefined, bookingIntent: string | undefined, fallbackPercent: number) {
    if (bookingIntent === 'pay_full') return 100;
    if (bookingIntent !== 'pay_deposit') return 0;

    const percent = Number(requestedPercent ?? fallbackPercent ?? 50);
    if (!Number.isFinite(percent)) return 50;
    return Math.min(Math.max(Math.round(percent), 10), 100);
  }

  private resolveInitialDeposit(totalPrice: number, depositPercent: number) {
    if (!depositPercent || depositPercent <= 0) return 0;
    return Math.round((totalPrice * Math.min(depositPercent, 100)) / 100);
  }

  private normalizeDiscountCode(code?: string | null) {
    const normalized = (code || '').trim().toUpperCase().replace(/[^A-Z0-9-_]/g, '').slice(0, 32);
    return normalized || undefined;
  }

  private getCheckoutAmount(booking: any, settings: SepaySettings) {
    if (booking.bookingIntent === 'pay_deposit' && booking.depositAmount > 0) {
      return booking.depositAmount;
    }

    if (booking.paymentStatus === 'deposit') {
      return Math.max(booking.totalPrice - booking.paidAmount, 0);
    }

    return booking.totalPrice;
  }

  private async attachSepayCheckout(booking: any, force = false) {
    const settings = await this.getSepaySettings();
    const shouldBuildCheckout = force || booking.requestedPaymentMethod === 'sepay' || booking.bookingIntent === 'pay_deposit' || booking.bookingIntent === 'pay_full';

    if (!shouldBuildCheckout || !settings.enabled) {
      return booking;
    }

    if (!settings.merchantId || !settings.secretKey) {
      return {
        ...booking,
        sepayCheckout: {
          enabled: false,
          configured: false,
          message: 'Sepay chưa được cấu hình merchant_id hoặc secret_key trong admin settings.',
        },
      };
    }

    const amount = this.getCheckoutAmount(booking, settings);
    if (amount <= 0) {
      return {
        ...booking,
        sepayCheckout: {
          enabled: true,
          configured: true,
          message: 'Booking đã được ghi nhận đủ tiền.',
        },
      };
    }

    const client = new SePayPgClient({
      env: settings.env,
      merchant_id: settings.merchantId,
      secret_key: settings.secretKey,
    });

    const fields = client.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: settings.paymentMethod,
      order_invoice_number: booking.paymentReference ?? booking.bookingCode ?? booking.id,
      order_amount: amount,
      currency: settings.currency,
      order_description: booking.transferContent ?? booking.bookingCode ?? booking.id,
      customer_id: booking.customerId ?? undefined,
      success_url: this.resolveCallbackUrl(settings.successUrl, booking),
      error_url: this.resolveCallbackUrl(settings.errorUrl, booking),
      cancel_url: this.resolveCallbackUrl(settings.cancelUrl, booking),
      custom_data: JSON.stringify({ bookingId: booking.id, bookingCode: booking.bookingCode }),
    });

    return {
      ...booking,
      sepayCheckout: {
        enabled: true,
        configured: true,
        checkoutUrl: client.checkout.initCheckoutUrl(),
        method: 'POST',
        fields,
      },
    };
  }

  private resolveCallbackUrl(url: string, booking: any) {
    if (!url) return undefined;

    return url
      .replace(/\{bookingId\}/g, booking.id)
      .replace(/\{bookingCode\}/g, booking.bookingCode ?? '')
      .replace(/\{paymentReference\}/g, booking.paymentReference ?? booking.bookingCode ?? '');
  }

  private async getSepaySettings(): Promise<SepaySettings> {
    const settings = await this.settingsService.getAllSettings(true);
    const depositPercent = Number(settings.sepay_deposit_percent || 50);
    const env = settings.sepay_env === 'production' ? 'production' : 'sandbox';
    const paymentMethod = settings.sepay_payment_method === 'NAPAS_BANK_TRANSFER' ? 'NAPAS_BANK_TRANSFER' : 'BANK_TRANSFER';

    return {
      enabled: settings.sepay_enabled === 'true',
      env,
      merchantId: settings.sepay_merchant_id || '',
      secretKey: settings.sepay_secret_key || '',
      paymentMethod,
      currency: settings.sepay_currency || 'VND',
      orderPrefix: settings.sepay_order_prefix || 'AV',
      depositPercent: Number.isFinite(depositPercent) ? depositPercent : 50,
      transferTemplate: settings.sepay_transfer_template || '{bookingCode} {customerName} {phoneLast4}',
      successUrl: settings.sepay_success_url || '',
      errorUrl: settings.sepay_error_url || '',
      cancelUrl: settings.sepay_cancel_url || '',
      ipnSecretKey: settings.sepay_ipn_secret_key || settings.sepay_secret_key || '',
    };
  }

  async handleSepayIpn(secretKey: string | undefined, body: any) {
    const settings = await this.getSepaySettings();
    if (!settings.enabled) {
      throw new BadRequestException('Sepay is disabled');
    }

    if (settings.ipnSecretKey && secretKey !== settings.ipnSecretKey) {
      throw new BadRequestException('Invalid Sepay IPN secret');
    }

    const invoiceNumber = body?.order?.order_invoice_number;
    if (!invoiceNumber) {
      throw new BadRequestException('Missing order invoice number');
    }

    const booking = await this.prisma.booking.findFirst({
      where: {
        OR: [
          { paymentReference: invoiceNumber },
          { bookingCode: invoiceNumber },
        ],
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found for Sepay invoice');
    }

    if (body?.notification_type !== 'ORDER_PAID') {
      return { success: true, ignored: true };
    }

    const paymentReference = invoiceNumber;
    const referenceCode = body?.transaction?.transaction_id ?? paymentReference;
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        bookingId: booking.id,
        method: 'sepay',
        referenceCode,
      },
    });

    if (existingPayment) {
      return {
        success: true,
        idempotent: true,
        booking: await this.prisma.booking.findUnique({
          where: { id: booking.id },
          include: this.includeRelations(),
        }),
      };
    }

    const paidAmount = Math.min(Number(body?.transaction?.transaction_amount || body?.order?.order_amount || booking.totalPrice), booking.totalPrice);
    return this.updatePayment(booking.id, {
      paidAmount: Math.max(booking.paidAmount, paidAmount >= booking.totalPrice ? booking.totalPrice : booking.paidAmount + paidAmount),
      amount: paidAmount,
      type: paidAmount >= booking.totalPrice ? 'final_payment' : 'deposit',
      method: 'sepay',
      referenceCode,
      paymentReference,
      transferContent: body?.order?.order_description ?? booking.transferContent,
      note: 'Sepay IPN ORDER_PAID',
    });
  }

  private includeRelations() {
    return {
      customer: true,
      location: true,
      property: true,
      productOption: true,
      payments: {
        orderBy: { createdAt: 'desc' as const },
      },
    };
  }
}
