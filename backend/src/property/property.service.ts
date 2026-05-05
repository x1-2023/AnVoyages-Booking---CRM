import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateOptionInventoryDto } from './dto/update-option-inventory.dto';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto) {
    const location = await this.prisma.location.findUnique({
      where: { id: createPropertyDto.locationId },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    const { options, ...propertyDto } = createPropertyDto;
    const data: any = {
      ...propertyDto,
    };

    if (createPropertyDto.images !== undefined) {
      data.images = JSON.stringify(createPropertyDto.images);
    }

    if (createPropertyDto.amenities !== undefined) {
      data.amenities = JSON.stringify(createPropertyDto.amenities);
    }

    if (createPropertyDto.amenitiesVi !== undefined) {
      data.amenitiesVi = JSON.stringify(createPropertyDto.amenitiesVi);
    }

    if (createPropertyDto.amenitiesEn !== undefined) {
      data.amenitiesEn = JSON.stringify(createPropertyDto.amenitiesEn);
    }

    if (createPropertyDto.pricingRules !== undefined) {
      data.pricingRules = JSON.stringify(createPropertyDto.pricingRules);
    }

    const created = await this.prisma.property.create({
      data: {
        ...data,
        options: options?.length ? { create: options.map((option) => this.toOptionPrismaData(option)) } : undefined,
      },
      include: {
        location: true,
        options: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    });

    return this.parsePropertyJson(created);
  }

  async findAll(locationId?: string, type?: string, isActive?: boolean) {
    const where: any = {};

    if (locationId) {
      where.locationId = locationId;
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const properties = await this.prisma.property.findMany({
      where,
      include: {
        location: true,
        options: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return properties.map((property) => this.parsePropertyJson(property));
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        location: true,
        options: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.parsePropertyJson(property);
  }

  async getAvailability(id: string, query: {
    productOptionId?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
  }) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        options: {
          where: query.productOptionId ? { id: query.productOptionId } : { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const option = query.productOptionId
      ? property.options.find((item) => item.id === query.productOptionId)
      : property.options[0];

    if (query.productOptionId && !option) {
      throw new NotFoundException('Product option not found');
    }

    if (!option || !query.checkIn || !query.checkOut) {
      return {
        available: true,
        limited: false,
        requestedUnits: 1,
        minimumAvailableUnits: null,
        dates: [],
      };
    }

    const checkIn = this.normalizeDateInput(query.checkIn);
    const checkOut = this.normalizeDateInput(query.checkOut);
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      throw new BadRequestException('Invalid availability dates');
    }

    const requestedUnits = this.getRequestedUnits(property, option, Number(query.adults || 1), Number(query.children || 0));
    const defaultInventory = Number(option.inventoryQuantity || 0);
    if (!defaultInventory) {
      return {
        available: true,
        limited: false,
        requestedUnits,
        minimumAvailableUnits: null,
        dates: [],
      };
    }

    const dates = this.getInventoryDates(checkIn, checkOut);
    const [overlappingBookings, overrides] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          productOptionId: option.id,
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
          status: { not: 'cancelled' },
          OR: [
            { bookingIntent: { in: ['pay_deposit', 'pay_full'] } },
            { status: { in: ['confirmed', 'deposit', 'paid'] } },
          ],
        },
        select: {
          checkIn: true,
          checkOut: true,
          productOptionQuantity: true,
        },
      }),
      this.prisma.productOptionInventory.findMany({
        where: {
          optionId: option.id,
          date: { in: dates },
        },
      }),
    ]);

    const overrideByDate = new Map(overrides.map((item) => [this.toDateKey(item.date), item]));
    const bookedByDate = new Map<string, number>();

    overlappingBookings.forEach((booking) => {
      this.getInventoryDates(booking.checkIn, booking.checkOut).forEach((date) => {
        const key = this.toDateKey(date);
        bookedByDate.set(key, (bookedByDate.get(key) || 0) + Math.max(booking.productOptionQuantity || 1, 1));
      });
    });

    const dateAvailability = dates.map((date) => {
      const key = this.toDateKey(date);
      const override = overrideByDate.get(key);
      const totalUnits = override ? override.totalUnits : defaultInventory;
      const bookedUnits = bookedByDate.get(key) || 0;
      const availableUnits = override?.closed ? 0 : Math.max(totalUnits - bookedUnits, 0);

      return { date: key, totalUnits, bookedUnits, availableUnits, closed: override?.closed || false };
    });

    const minimumAvailableUnits = Math.min(...dateAvailability.map((item) => item.availableUnits));

    return {
      available: minimumAvailableUnits >= requestedUnits,
      limited: true,
      requestedUnits,
      minimumAvailableUnits,
      dates: dateAvailability,
    };
  }

  async getInventoryCalendar(id: string, startDate?: string, days = 30) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        location: true,
        options: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const safeDays = Math.min(Math.max(Number(days) || 30, 1), 90);
    const start = startDate ? this.normalizeDateInput(startDate) : this.startOfUtcDay(new Date());
    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException('Invalid inventory start date');
    }

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + safeDays);
    const dates = this.getInventoryDates(start, end);
    const optionIds = property.options.map((option) => option.id);

    const [overrides, bookings] = await Promise.all([
      this.prisma.productOptionInventory.findMany({
        where: {
          optionId: { in: optionIds },
          date: { in: dates },
        },
      }),
      this.prisma.booking.findMany({
        where: {
          productOptionId: { in: optionIds },
          checkIn: { lt: end },
          checkOut: { gt: start },
          status: { not: 'cancelled' },
          OR: [
            { bookingIntent: { in: ['pay_deposit', 'pay_full'] } },
            { status: { in: ['confirmed', 'deposit', 'paid'] } },
          ],
        },
        select: {
          productOptionId: true,
          productOptionQuantity: true,
          checkIn: true,
          checkOut: true,
          bookingCode: true,
          customerName: true,
        },
      }),
    ]);

    const overrideByOptionDate = new Map(overrides.map((item) => [`${item.optionId}:${this.toDateKey(item.date)}`, item]));
    const bookedByOptionDate = new Map<string, number>();

    bookings.forEach((booking) => {
      if (!booking.productOptionId) return;

      this.getInventoryDates(booking.checkIn, booking.checkOut).forEach((date) => {
        const key = `${booking.productOptionId}:${this.toDateKey(date)}`;
        bookedByOptionDate.set(key, (bookedByOptionDate.get(key) || 0) + Math.max(booking.productOptionQuantity || 1, 1));
      });
    });

    return {
      property: this.parsePropertyJson({ ...property, options: [] }),
      startDate: this.toDateKey(start),
      endDate: this.toDateKey(end),
      options: property.options.map((option) => {
        const defaultUnits = Number(option.inventoryQuantity || 0);
        return {
          ...this.parseOptionJson(option),
          defaultUnits,
          dates: dates.map((date) => {
            const key = `${option.id}:${this.toDateKey(date)}`;
            const override = overrideByOptionDate.get(key);
            const totalUnits = override ? override.totalUnits : defaultUnits;
            const bookedUnits = bookedByOptionDate.get(key) || 0;
            const closed = override?.closed || false;
            return {
              date: this.toDateKey(date),
              totalUnits,
              bookedUnits,
              availableUnits: closed ? 0 : Math.max(totalUnits - bookedUnits, 0),
              closed,
              isOverride: Boolean(override),
              note: override?.note || '',
            };
          }),
        };
      }),
    };
  }

  async updateOptionInventory(optionId: string, dto: UpdateOptionInventoryDto) {
    const option = await this.prisma.productOption.findUnique({ where: { id: optionId } });
    if (!option) {
      throw new NotFoundException('Product option not found');
    }

    const date = this.normalizeDateInput(dto.date);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid inventory date');
    }

    return this.prisma.productOptionInventory.upsert({
      where: {
        optionId_date: {
          optionId,
          date,
        },
      },
      update: {
        totalUnits: Number(dto.totalUnits) || 0,
        closed: dto.closed ?? false,
        note: dto.note,
      },
      create: {
        optionId,
        date,
        totalUnits: Number(dto.totalUnits) || 0,
        closed: dto.closed ?? false,
        note: dto.note,
      },
    });
  }

  async deleteOptionInventory(optionId: string, value: string) {
    const option = await this.prisma.productOption.findUnique({ where: { id: optionId } });
    if (!option) {
      throw new NotFoundException('Product option not found');
    }

    const date = this.normalizeDateInput(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid inventory date');
    }

    await this.prisma.productOptionInventory.deleteMany({
      where: {
        optionId,
        date,
      },
    });

    return { success: true };
  }

  async findCategories(isActive?: boolean) {
    const categories = await this.prisma.productCategory.findMany({
      where: isActive === undefined ? undefined : { isActive },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return categories;
  }

  async createCategory(dto: CreateProductCategoryDto) {
    const slug = await this.ensureUniqueCategorySlug(dto.slug || dto.name);

    return this.prisma.productCategory.create({
      data: {
        name: dto.name,
        nameVi: dto.nameVi || dto.name,
        nameEn: dto.nameEn,
        slug,
        description: dto.description,
        descriptionVi: dto.descriptionVi || dto.description,
        descriptionEn: dto.descriptionEn,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (updatePropertyDto.locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: updatePropertyDto.locationId },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }
    }

    const { options, ...propertyDto } = updatePropertyDto;
    const data: any = { ...propertyDto };

    if (updatePropertyDto.images !== undefined) {
      data.images = JSON.stringify(updatePropertyDto.images);
    }

    if (updatePropertyDto.amenities !== undefined) {
      data.amenities = JSON.stringify(updatePropertyDto.amenities);
    }

    if (updatePropertyDto.amenitiesVi !== undefined) {
      data.amenitiesVi = JSON.stringify(updatePropertyDto.amenitiesVi);
    }

    if (updatePropertyDto.amenitiesEn !== undefined) {
      data.amenitiesEn = JSON.stringify(updatePropertyDto.amenitiesEn);
    }

    if (updatePropertyDto.pricingRules !== undefined) {
      data.pricingRules = JSON.stringify(updatePropertyDto.pricingRules);
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        ...data,
        ...(options
          ? {
              options: {
                deleteMany: {},
                create: options.map((option) => this.toOptionPrismaData(option)),
              },
            }
          : {}),
      },
      include: {
        location: true,
        options: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    });

    return this.parsePropertyJson(updated);
  }

  async remove(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    await this.prisma.property.delete({
      where: { id },
    });

    return { message: 'Property deleted successfully' };
  }

  private parsePropertyJson(property: any) {
    return {
      ...property,
      images: this.parseJsonArray(property.images),
      amenities: this.parseJsonArray(property.amenities),
      amenitiesVi: this.parseJsonArray(property.amenitiesVi),
      amenitiesEn: this.parseJsonArray(property.amenitiesEn),
      pricingRules: this.parseJsonArray(property.pricingRules),
      options: (property.options || []).map((option: any) => this.parseOptionJson(option)),
    };
  }

  private parseOptionJson(option: any) {
    return {
      ...option,
      images: this.parseJsonArray(option.images),
      amenities: this.parseJsonArray(option.amenities),
      amenitiesVi: this.parseJsonArray(option.amenitiesVi),
      amenitiesEn: this.parseJsonArray(option.amenitiesEn),
    };
  }

  private toOptionPrismaData(option: any) {
    const { id: _id, images, amenities, amenitiesVi, amenitiesEn, ...data } = option;
    return {
      ...data,
      optionType: data.optionType || 'package',
      name: data.nameVi || data.name,
      description: data.descriptionVi || data.description,
      basePrice: Number(data.basePrice) || 0,
      adultPrice: data.adultPrice === undefined ? undefined : Number(data.adultPrice) || undefined,
      childPrice: data.childPrice === undefined ? undefined : Number(data.childPrice) || undefined,
      costPrice: Number(data.costPrice) || 0,
      maxGuests: data.maxGuests === undefined ? undefined : Number(data.maxGuests) || undefined,
      maxAdults: data.maxAdults === undefined ? undefined : Number(data.maxAdults) || undefined,
      maxChildren: data.maxChildren === undefined ? undefined : Number(data.maxChildren) || undefined,
      inventoryQuantity: data.inventoryQuantity === undefined ? undefined : Number(data.inventoryQuantity) || undefined,
      durationDays: data.durationDays === undefined ? undefined : Number(data.durationDays) || undefined,
      bedCount: data.bedCount === undefined ? undefined : Number(data.bedCount) || undefined,
      areaSqm: data.areaSqm === undefined ? undefined : Number(data.areaSqm) || undefined,
      sortOrder: Number(data.sortOrder) || 0,
      isActive: data.isActive ?? true,
      images: images === undefined ? undefined : JSON.stringify(images),
      amenities: amenities === undefined ? undefined : JSON.stringify(amenities),
      amenitiesVi: amenitiesVi === undefined ? undefined : JSON.stringify(amenitiesVi),
      amenitiesEn: amenitiesEn === undefined ? undefined : JSON.stringify(amenitiesEn),
    };
  }

  private parseJsonArray(value?: string | null) {
    if (!value) {
      return [];
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private normalizeDateInput(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private startOfUtcDay(value: Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  private getRequestedUnits(property: any, option: any, adultCount: number, childCount: number) {
    if (!this.isUnitBasedBooking(property?.type, option?.optionType)) return 1;

    const guests = Math.max(Math.round(adultCount || 1) + Math.round(childCount || 0), 1);
    const guestCapacity = Math.max(Number(option.maxGuests || property.maxGuests || 1), 1);
    const adultCapacity = Math.max(Number(option.maxAdults || guestCapacity), 1);
    const childCapacity = option.maxChildren === null || option.maxChildren === undefined
      ? guestCapacity
      : Math.max(Number(option.maxChildren), 0);

    if (childCount > 0 && childCapacity <= 0) return Number.POSITIVE_INFINITY;

    return Math.max(
      Math.ceil(guests / guestCapacity),
      Math.ceil(Math.max(adultCount, 1) / adultCapacity),
      childCount > 0 ? Math.ceil(childCount / childCapacity) : 1,
      1,
    );
  }

  private isUnitBasedBooking(propertyType?: string, optionType?: string) {
    if (['room', 'cabin', 'vehicle'].includes(optionType || '')) return true;
    return ['hotel', 'homestay', 'cruise', 'transport', 'car-rental'].includes(propertyType || '');
  }

  private getInventoryDates(checkIn: Date, checkOut: Date) {
    const dates: Date[] = [];
    const cursor = new Date(Date.UTC(checkIn.getUTCFullYear(), checkIn.getUTCMonth(), checkIn.getUTCDate()));
    const end = new Date(Date.UTC(checkOut.getUTCFullYear(), checkOut.getUTCMonth(), checkOut.getUTCDate()));

    while (cursor < end) {
      dates.push(new Date(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return dates;
  }

  private toDateKey(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  private async ensureUniqueCategorySlug(value: string) {
    const base = this.slugify(value) || `phan-loai-${Date.now()}`;
    let slug = base;
    let suffix = 2;

    while (await this.prisma.productCategory.findUnique({ where: { slug } })) {
      slug = `${base}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private slugify(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);
  }
}
