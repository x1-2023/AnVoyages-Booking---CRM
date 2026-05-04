import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';

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
      durationDays: data.durationDays === undefined ? undefined : Number(data.durationDays) || undefined,
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
