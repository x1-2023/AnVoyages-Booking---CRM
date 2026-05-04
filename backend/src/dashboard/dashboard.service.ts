import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '../booking/enums/booking-status.enum';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverview(startDate?: Date, endDate?: Date) {
    const dateFilter = this.getDateFilter(startDate, endDate);

    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      totalRevenue,
      totalPaid,
      activeLocations,
      activeProperties,
    ] = await Promise.all([
      this.prisma.booking.count({ where: dateFilter }),
      this.prisma.booking.count({
        where: { ...dateFilter, status: BookingStatus.COMPLETED },
      }),
      this.prisma.booking.count({
        where: { ...dateFilter, status: BookingStatus.CANCELLED },
      }),
      this.prisma.booking.count({
        where: { ...dateFilter, status: BookingStatus.PENDING },
      }),
      this.getTotalRevenue(dateFilter),
      this.getTotalPaid(dateFilter),
      this.prisma.location.count({ where: { isActive: true } }),
      this.prisma.property.count({ where: { isActive: true } }),
    ]);

    return {
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        pending: pendingBookings,
      },
      revenue: {
        total: totalRevenue,
        paid: totalPaid,
        unpaid: totalRevenue - totalPaid,
      },
      resources: {
        activeLocations,
        activeProperties,
      },
    };
  }

  async getRevenueByLocation(startDate?: Date, endDate?: Date) {
    const dateFilter = this.getDateFilter(startDate, endDate);

    const bookings = await this.prisma.booking.groupBy({
      by: ['locationId'],
      where: {
        ...dateFilter,
        status: BookingStatus.COMPLETED,
      },
      _sum: {
        totalPrice: true,
        paidAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const revenueByLocation = await Promise.all(
      bookings.map(async (booking) => {
        const location = await this.prisma.location.findUnique({
          where: { id: booking.locationId },
          select: { id: true, name: true },
        });

        return {
          location,
          bookingCount: booking._count.id,
          totalRevenue: booking._sum.totalPrice || 0,
          totalPaid: booking._sum.paidAmount || 0,
        };
      }),
    );

    return revenueByLocation;
  }

  async getRevenueByProperty(locationId?: string, startDate?: Date, endDate?: Date) {
    const dateFilter = this.getDateFilter(startDate, endDate);
    const where: any = {
      ...dateFilter,
      status: BookingStatus.COMPLETED,
    };

    if (locationId) {
      where.locationId = locationId;
    }

    const bookings = await this.prisma.booking.groupBy({
      by: ['propertyId'],
      where,
      _sum: {
        totalPrice: true,
        paidAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const revenueByProperty = await Promise.all(
      bookings
        .filter((b) => b.propertyId)
        .map(async (booking) => {
          const property = await this.prisma.property.findUnique({
            where: { id: booking.propertyId },
            select: {
              id: true,
              name: true,
              type: true,
              location: {
                select: { id: true, name: true },
              },
            },
          });

          return {
            property,
            bookingCount: booking._count.id,
            totalRevenue: booking._sum.totalPrice || 0,
            totalPaid: booking._sum.paidAmount || 0,
          };
        }),
    );

    return revenueByProperty;
  }

  async getRevenueByMonth(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const bookings = await this.prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: BookingStatus.COMPLETED,
      },
      select: {
        createdAt: true,
        totalPrice: true,
        paidAmount: true,
      },
    });

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalRevenue: 0,
      totalPaid: 0,
      bookingCount: 0,
    }));

    bookings.forEach((booking) => {
      const month = booking.createdAt.getMonth();
      monthlyRevenue[month].totalRevenue += booking.totalPrice;
      monthlyRevenue[month].totalPaid += booking.paidAmount;
      monthlyRevenue[month].bookingCount += 1;
    });

    return monthlyRevenue;
  }

  async getTopProperties(limit: number = 10, startDate?: Date, endDate?: Date) {
    const dateFilter = this.getDateFilter(startDate, endDate);

    const bookings = await this.prisma.booking.groupBy({
      by: ['propertyId'],
      where: {
        ...dateFilter,
        status: BookingStatus.COMPLETED,
        propertyId: { not: null },
      },
      _sum: {
        totalPrice: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
      take: limit,
    });

    const topProperties = await Promise.all(
      bookings.map(async (booking) => {
        const property = await this.prisma.property.findUnique({
          where: { id: booking.propertyId },
          include: {
            location: {
              select: { id: true, name: true },
            },
          },
        });

        return {
          property,
          bookingCount: booking._count.id,
          totalRevenue: booking._sum.totalPrice || 0,
        };
      }),
    );

    return topProperties;
  }

  async getRecentBookings(limit: number = 10) {
    return this.prisma.booking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        location: true,
        property: true,
      },
    });
  }

  private async getTotalRevenue(where: any) {
    const result = await this.prisma.booking.aggregate({
      where: {
        ...where,
        status: BookingStatus.COMPLETED,
      },
      _sum: {
        totalPrice: true,
      },
    });

    return result._sum.totalPrice || 0;
  }

  private async getTotalPaid(where: any) {
    const result = await this.prisma.booking.aggregate({
      where: {
        ...where,
        paymentStatus: { in: ['deposit', 'paid'] },
      },
      _sum: {
        paidAmount: true,
      },
    });

    return result._sum.paidAmount || 0;
  }

  private getDateFilter(startDate?: Date, endDate?: Date) {
    if (!startDate && !endDate) {
      return {};
    }

    const filter: any = { createdAt: {} };

    if (startDate) {
      filter.createdAt.gte = startDate;
    }

    if (endDate) {
      filter.createdAt.lte = endDate;
    }

    return filter;
  }
}
