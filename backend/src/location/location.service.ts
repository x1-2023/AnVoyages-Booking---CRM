import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    const existingLocation = await this.prisma.location.findUnique({
      where: { slug: createLocationDto.slug },
    });

    if (existingLocation) {
      throw new ConflictException('Location with this slug already exists');
    }

    return this.prisma.location.create({
      data: createLocationDto,
    });
  }

  async findAll(isActive?: boolean) {
    const where = isActive !== undefined ? { isActive } : {};

    return this.prisma.location.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            properties: true,
            bookings: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: {
        properties: {
          where: { isActive: true },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async findBySlug(slug: string) {
    const location = await this.prisma.location.findUnique({
      where: { slug },
      include: {
        properties: {
          where: { isActive: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    if (updateLocationDto.slug && updateLocationDto.slug !== location.slug) {
      const existingLocation = await this.prisma.location.findUnique({
        where: { slug: updateLocationDto.slug },
      });

      if (existingLocation) {
        throw new ConflictException('Location with this slug already exists');
      }
    }

    return this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async remove(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    await this.prisma.location.delete({
      where: { id },
    });

    return { message: 'Location deleted successfully' };
  }
}
